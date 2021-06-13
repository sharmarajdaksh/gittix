import express from "express";

import { currentUser } from "@microservices-with-react-and-node-sharmarajdaksh/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
  res.send({ user: req.user || null });
});

export { router as currentUserRouter };
