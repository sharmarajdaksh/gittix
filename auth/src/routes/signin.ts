import express from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/user";
import { validateRequest } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import { BadRequestError } from "@microservices-with-react-and-node-sharmarajdaksh/common";
import { Password } from "../services/password";

const router = express.Router();

const signinRequestValidations = [
  body("email").isEmail().withMessage("Email address must be valid"),
  body("password").trim().notEmpty().withMessage("No password supplied"),
];

router.post(
  "/api/users/signin",
  signinRequestValidations,
  validateRequest,
  async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid email or password");
    }

    const passwordsMatched = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatched) {
      throw new BadRequestError("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = { jwt: token };

    return res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
