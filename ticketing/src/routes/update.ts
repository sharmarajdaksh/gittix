import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";
import express from "express";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const requestValidations = [
  body("title").not().isEmpty().withMessage("Title is required"),
  body("price")
    .not()
    .isEmpty()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
];

router.put(
  "/api/tickets/:id",
  requireAuth,
  requestValidations,
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    const id = req.params.id;
    const { title, price } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.user!.id) {
      throw new NotAuthorizedError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot update a reserved ticket");
    }

    ticket.set({
      title,
      price,
    });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publishData({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: req.user!.id,
      version: ticket.version,
    });

    return res.send(ticket);
  }
);

export { router as updateTicketRouter };
