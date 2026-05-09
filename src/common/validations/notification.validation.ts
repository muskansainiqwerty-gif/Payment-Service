import { Request, Response, NextFunction } from "express";
import { failResponse } from "../util/response.handler";
import * as joiOptions from "./joi.validation";
const Joi = require("joi");



export const notificationListValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      status: Joi.string().valid(0, 1).optional(),
      type: Joi.string().required(),
    });

    const { error } = transSchema.validate(reqBody, joiOptions.options);
    if (error) {
      throw {
        message: joiOptions.capitalize(error.details[0].message),
      };
    }
    return next();
  } catch (err: any) {
    return failResponse(true, err?.message, res);
  }
};
export const notificationUpdateValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      status: Joi.string().valid(0, 1).required(),
      id: Joi.string().required(),
    });

    const { error } = transSchema.validate(reqBody, joiOptions.options);
    if (error) {
      throw {
        message: joiOptions.capitalize(error.details[0].message),
      };
    }
    return next();
  } catch (err: any) {
    return failResponse(true, err?.message, res);
  }
};
export const notificationDeleteValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      id: Joi.string().required(),
    });

    const { error } = transSchema.validate(reqBody, joiOptions.options);
    if (error) {
      throw {
        message: joiOptions.capitalize(error.details[0].message),
      };
    }
    return next();
  } catch (err: any) {
    return failResponse(true, err?.message, res);
  }
};