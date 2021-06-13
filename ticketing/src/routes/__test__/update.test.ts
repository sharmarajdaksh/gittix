import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns 404 if a ticket does not exist", async () => {
  const cookie = global.signin();
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({ title: "Valid title", price: 20 })
    .expect(404);
});

it("returns 401 if the user is not logged in", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "Valid title", price: 20 })
    .expect(401);
});

it("returns 401 if the ticket is not owned by the user", async () => {
  let cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: 20 })
    .expect(201);

  const ticketId = response.body.id;
  cookie = global.signin();
  const updateResponse = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title: "Invalid Title", price: 50 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: 20 })
    .expect(201);

  const ticketId = response.body.id;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 50 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: -50 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: "0" })
    .expect(400);
});

it("updates the ticket provided valid input", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: 20 })
    .expect(201);

  const ticketId = response.body.id;
  const title = "Updated Valid Title";
  const price = 50;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send();
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("publishes an event", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: 20 })
    .expect(201);

  const ticketId = response.body.id;
  const title = "Updated Valid Title";
  const price = 50;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(200);

  await request(app).get(`/api/tickets/${ticketId}`).send();

  expect(natsWrapper.client.publish).toBeCalledTimes(2);
});

it("rejects updates if a ticket is reserved", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title: "Valid Title", price: 20 })
    .expect(201);

  const ticketId = response.body.id;

  const ticket = await Ticket.findById(ticketId);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const title = "Updated Valid Title";
  const price = 50;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie)
    .send({ title, price })
    .expect(400);
});
