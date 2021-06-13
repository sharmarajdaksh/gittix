import { requireAuth } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import express from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/",
  requireAuth,
  async (req: express.Request, res: express.Response) => {
    const orders = await Order.find({
      userId: req.user!.id,
    }).populate("ticket");

    return res.send({ orders });
  }
);

export { router as indexOrderRouter };
