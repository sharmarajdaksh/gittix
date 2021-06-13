import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders/")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "concert",
  });
  await ticket.save();
  const order = Order.build({
    ticket: ticket,
    userId: "1234567",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders/")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "concert",
  });
  await ticket.save();

  await request(app)
    .post("/api/orders/")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const savedTicket = Ticket.findById(ticket.id);
  expect(savedTicket).toBeTruthy();
});

it("publishes an event", async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "concert",
  });
  await ticket.save();

  await request(app)
    .post("/api/orders/")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const savedTicket = Ticket.findById(ticket.id);
  expect(savedTicket).toBeTruthy();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
