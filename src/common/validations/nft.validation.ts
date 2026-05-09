import { Request, Response, NextFunction } from "express";
import { failResponse } from "../util/response.handler";
import * as joiOptions from "./joi.validation";
const Joi = require("joi");
/**
 * @funcion Create nft validation
 * @param req
 * @param res
 * @param next
 * @returns
 */


export const purchaseNftValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;
    const transSchema = Joi.object({
      title: Joi.string().trim().required(),
      nftId: Joi.string().trim().required(),
      nftListId: Joi.string().trim().required(),
      type: Joi.string().required(),
      price: Joi.number().required(),
      quantity: Joi.number().required(),
      totalPrice: Joi.number().required(),
      txnHash: Joi.string().trim().required(),
      currency: Joi.string().trim().required(),
      paymentGateway: Joi.string().trim().required(),
      platformFees: Joi.string().required(),
      royalty: Joi.string().required(),
      walletAddress: Joi.string().required(),
      transactionId: Joi.string().required(),
      address: Joi.string().required(),
  
    });
    const { error } = transSchema.validate(reqBody, joiOptions.options);
    if (error) {
      throw {
        message: joiOptions.capitalize(error.details[0].message),
      };
    }
    return next();
  } catch (error: any) {
    return failResponse(true, error?.message, res);
  }
};


