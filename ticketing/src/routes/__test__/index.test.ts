import request from "supertest";
import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  const cookie = global.signin();
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie)
    .send({ title, price });
};

it("should fetch a list of tickets", async () => {
  await createTicket("Valid Ticket 1", 10);
  await createTicket("Valid Ticket 2", 20);
  await createTicket("Valid Ticket 3", 30);

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.tickets.length).toEqual(3);
});
