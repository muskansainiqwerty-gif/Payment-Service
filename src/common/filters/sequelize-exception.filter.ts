// common/filters/sequelize-exception.filter.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Catch(Error) // Catch all errors (including Sequelize errors)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    console.error('Sequelize Error:', exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database operation failed',
      error: exception.message, // Optionally include the error message for debugging
    });
  }
}
