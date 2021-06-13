import express from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get(
  "/api/tickets/",
  async (req: express.Request, res: express.Response) => {
    const tickets = await Ticket.find({
      orderId: undefined,
    });

    return res.send({ tickets });
  }
);

export { router as indexTicketRouter };
