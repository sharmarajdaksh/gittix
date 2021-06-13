import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async (title: string, price: number) => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title,
    price,
  });
  await ticket.save();
  return ticket;
};

it("successfully fetches a user", async () => {
  const ticket = await buildTicket("ticket", 20);

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders/")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${order.id}/`)
    .set("Cookie", cookie)
    .expect(200);

  expect(response.body.id).toEqual(order.id);
  expect(response.body.ticket.id).toEqual(ticket.id);
});

it("returns an error if a user tries to fetch another user's order", async () => {
  const ticket = await buildTicket("ticket", 20);

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders/")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}/`)
    .set("Cookie", global.signin())
    .expect(401);
});
