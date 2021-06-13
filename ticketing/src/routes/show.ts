import { NotFoundError } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import express from "express";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get(
  "/api/tickets/:id",
  async (req: express.Request, res: express.Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    return res.send(ticket);
  }
);

export { router as showTicketTouter };
