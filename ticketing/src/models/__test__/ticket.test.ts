import { Ticket } from "../ticket";
import mongoose from "mongoose";

it("implements optimistic concurrency control", async (done) => {
  const ticket = Ticket.build({
    price: 10,
    title: "First ticket",
    userId: "123456789",
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();

  try {
    // Should error because version inside database has changed
    await secondInstance!.save();
  } catch (e) {
    return done();
  }

  throw new Error("Should not reach this point");
});

it("should increment the version number on every update", async () => {
  const ticket = Ticket.build({
    price: 10,
    title: "First ticket",
    userId: "123456789",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
