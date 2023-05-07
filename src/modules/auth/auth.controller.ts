import { Request, Response } from "express";
import httpStatus from "http-status";

import { emailService } from "../email";
import { tokenService } from "../token";
import { userService } from "../user";
import { catchAsync } from "@dinedrop/shared";
import * as authService from "./auth.service";
import { sendMessageToKafkaTopic } from "../kafka/producer";

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUser(req.body);
  const broadcastedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  sendMessageToKafkaTopic("user-registered", broadcastedUser).then(() => {
    console.log(`${user.name} registered message sent to Kafka`);
  });
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...userWithTokens });
});

export const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(
      req.body.email
    );
    await emailService.sendResetPasswordEmail(
      req.body.email,
      resetPasswordToken
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.query["token"], req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const sendVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(
      req.user
    );
    await emailService.sendVerificationEmail(
      req.user.email,
      verifyEmailToken,
      req.user.name
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
);

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.query["token"]);
  res.status(httpStatus.NO_CONTENT).send();
});
