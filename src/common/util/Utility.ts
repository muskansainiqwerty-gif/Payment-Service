import { Request, Response, NextFunction } from 'express';
import { INVALID_BODY_TOKEN } from '../../constants/message.constant';
import { returnError, returnSuccess } from './response.handler';
import * as CryptoJS from 'crypto-js';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosRequestConfig } from 'axios';
import { registerDecorator, ValidationOptions } from 'class-validator';
const PROJECT_NAME_ENCRYPTION_KEY = process.env.PROJECT_NAME_ENCRYPTION_KEY;
const encryption_key = `${PROJECT_NAME_ENCRYPTION_KEY}`;
const jwtService = new JwtService({
  secret: process.env.JWT_SECRET, // Make sure to configure your JWT secret
});
export const createRandomString = async () => {
  const rendomStr = Array(64)
    .fill(0)
    .map((x) => Math.random().toString(36).charAt(2))
    .join('');
  return rendomStr;
};

// Function to get the day number from the enum value
