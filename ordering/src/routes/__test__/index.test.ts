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

it("fetches orders for a particular user", async () => {
  const ticketOne = await buildTicket("ticket one", 20);
  const ticketTwo = await buildTicket("ticket two", 10);
  const ticketThree = await buildTicket("ticket three", 30);

  const userOne = global.signin();
  const userTwo = global.signin();

  await request(app)
    .post("/api/orders/")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id });

  const { body: orderOne } = await request(app)
    .post("/api/orders/")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id });
  const { body: orderTwo } = await request(app)
    .post("/api/orders/")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id });

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].id).toEqual(orderOne.id);
  expect(response.body.orders[1].id).toEqual(orderTwo.id);
  expect(response.body.orders[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body.orders[1].ticket.id).toEqual(ticketThree.id);
});
