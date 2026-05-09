import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  successResponse,
  failResponse,
} from '../../common/util/response.handler';
import * as MESSAGE from '../../constants/message.constant';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentService } from './payment.service';
import { PaginatePaymentDto } from './dto/paginate-payment.dto';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({
    summary: 'Create payment',
    description:
      'Creates a payment in PENDING state and publishes it to RabbitMQ for asynchronous processing.',
  })
  @ApiHeader({
    name: 'x-idempotency-key',
    required: false,
    description:
      'Optional idempotency key. Reusing the same key with same payload returns same payment.',
    example: 'pay-order-001',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiOkResponse({
    status: 201,
    description: 'Payment created and queued.',
    schema: {
      example: {
        error: false,
        message: 'Payment created and queued for processing.',
        status: 201,
        data: {
          id: '08f1a6c7-bffd-4ee9-abcd-0be2b2a38144',
          orderId: 'MB_1778340498619_33',
          amount: 249,
          currency: 'INR',
          status: 'PENDING',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Validation error or idempotency key reused with a different payload.',
  })
  async createPayment(
    @Req() request: any,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const body: CreatePaymentDto = request.body;
      const userId = request.user?.id || 'guest-user';
      const payment = await this.paymentService.createPayment(
        body,
        userId,
        request.idempotencyMeta,
      );
      const payload = {
        error: false,
        message: 'Payment created and queued for processing.',
        data: payment,
        status: 201,
      };
      await successResponse(
        payload.message,
        payload.data,
        response,
        payload.status,
      );
    } catch (error) {
      await failResponse(
        true,
        (error as Error).message || MESSAGE.SOMETHING_WENT_WRONG,
        response,
        400,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Payment UUID',
    example: '08f1a6c7-bffd-4ee9-abcd-0be2b2a38144',
  })
  @ApiOkResponse({
    description: 'Payment details fetched.',
  })
  @ApiNotFoundResponse({ description: 'Payment not found.' })
  async getPaymentById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const payment = await this.paymentService.getPaymentById(id);
      if (!payment) {
        await failResponse(true, 'Payment not found.', response, 404);
        return;
      }
      await successResponse(
        'Payment fetched successfully.',
        payment,
        response,
        200,
      );
    } catch (error) {
      await failResponse(
        true,
        (error as Error).message || MESSAGE.SOMETHING_WENT_WRONG,
        response,
        400,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'List payments (paginated)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiOkResponse({
    description: 'Paginated payments fetched.',
    schema: {
      example: {
        error: false,
        message: 'Payments fetched successfully.',
        status: 200,
        data: {
          rows: [],
          count: 0,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  async getMyPayments(
    @Req() request: any,
    @Query() query: PaginatePaymentDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const userId = request.user?.id || 'guest-user';
      const payments = await this.paymentService.getUserPayments(userId, query);
      await successResponse(
        'Payments fetched successfully.',
        payments,
        response,
        200,
      );
    } catch (error) {
      await failResponse(
        true,
        (error as Error).message || MESSAGE.SOMETHING_WENT_WRONG,
        response,
        400,
      );
    }
  }
}
