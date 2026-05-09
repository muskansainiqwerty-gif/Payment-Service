import { Request, Response, NextFunction } from "express";
import { failResponse } from "../util/response.handler";
import * as joiOptions from "./joi.validation";
const Joi = require("joi");

export const signupValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().required(),
      userName: Joi.string().max(15).required(),
      password: Joi.string().min(3).max(15).required(),
      confirm_password: Joi.valid(reqBody.password).required().messages({
        "any.only": "confirm passwords do not match",
        "any.required": "confirm password is required",
      }),
      type: Joi.string().valid(1, 2).required(), // 1: USER, 2: INFLUENCER
      socialLinks: Joi.object().optional(),
      email: Joi.string().email().optional(),
      phoneNumber: Joi.string().min(10).max(10).optional(),
      phoneCode: Joi.string().optional(),
      signup_as: Joi.string().valid(1, 2, 3).required(), // 1: EMAIL, 2: PHONE
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

export const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      phoneNumber: Joi.string().optional(),
      email: Joi.string().optional(),
      password: Joi.string().required(),
      login_as: Joi.string().valid(1, 2).required(), // 1: EMAIL, 2: PHONE
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

export const kycValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().required(),
      dob: Joi.string().required(),
      zipCode: Joi.string().required(),
      address: Joi.string().required(),
      country: Joi.string().required(),
      document: Joi.string().required(),
      documentType: Joi.string().required(),
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

export const resendOtpValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      phoneNumber: Joi.string().optional(),
      email: Joi.string().optional(),
      type: Joi.string().required(),
      resend_as: Joi.string().valid(1, 2).required(), // 1: EMAIL, 2: PHONE
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

export const verifyOtpValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      phoneNumber: Joi.string().optional(),
      email: Joi.string().optional(),
      type: Joi.string().required(),
      otp: Joi.string().required(),
      verify_as: Joi.string().valid(1, 2).required(), // 1: EMAIL, 2: PHONE
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

export const forgotPasswordValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      phoneNumber: Joi.string().optional(),
      email: Joi.string().optional(),
      type: Joi.string().required(),
      forgot_as: Joi.string().valid(1, 2).required(), // 1: EMAIL, 2: PHONE
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

export const updatePasswordValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      password: Joi.string().min(3).max(15).required(),
      confirm_password: Joi.valid(reqBody.password).required().messages({
        "any.only": "confirm passwords do not match",
        "any.required": "confirm password is required",
      }),
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

export const paginationValidation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reqBody = req.params;
    const transSchema = Joi.object({
      offset: Joi.number().max(1000).required(),
      limit: Joi.number().max(1000).required(),
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

export const addBankValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      holderName: Joi.string().required(),
      bankName: Joi.string().required(),
      accountNumber: Joi.string().required(),
      bic: Joi.string().required(),
      streetNo: Joi.string().required(),
      zipCode: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      currency: Joi.string().required(),
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
