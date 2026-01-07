import {
  loginService,
  logoutService,
  refreshService,
  registerService,
} from "../services/auth-service.js";
import { asyncHandler } from "../utils/async-handler.js";
import type { Request, Response } from "express";
import { throwHttpError } from "../utils/http-error.js";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await registerService(req.body);

    res.status(201).json({ data });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken } = await loginService(req.body);

    res
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
      })
      .status(200)
      .json({ data: accessToken });
  }
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throwHttpError(401, "Refresh token missing");
    }

    const { accessToken, newRefreshToken } = await refreshService(refreshToken);

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    res.json({ accessToken });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await logoutService(refreshToken);
    }

    res
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      })
      .status(200)
      .send();
  }
);
