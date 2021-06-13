import express from "express";
import {
  requireAuth,
  validateRequest,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
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

router.post(
  "/api/tickets",
  requireAuth,
  requestValidations,
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({ title, price, userId: req.user!.id });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publishData({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: req.user!.id,
      version: ticket.version,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
