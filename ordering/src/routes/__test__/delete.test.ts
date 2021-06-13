import { OrderStatus } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";
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

it("successfully cancels an order", async () => {
  const ticket = await buildTicket("ticket", 20);

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders/")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}/`)
    .set("Cookie", cookie)
    .expect(204);

  const response = await request(app)
    .get(`/api/orders/${order.id}/`)
    .set("Cookie", cookie)
    .expect(200);

  expect(response.body.id).toEqual(order.id);
  expect(response.body.ticket.id).toEqual(ticket.id);
  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it("returns an error if a user tries to delete another user's order", async () => {
  const ticket = await buildTicket("ticket", 20);

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders/")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}/`)
    .set("Cookie", global.signin())
    .expect(401);
});

it("Emits an order cancelled event", async () => {
  const ticket = await buildTicket("ticket", 20);

  const cookie = global.signin();

  const { body: order } = await request(app)
    .post("/api/orders/")
    .set("Cookie", cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}/`)
    .set("Cookie", global.signin())
    .expect(401);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
