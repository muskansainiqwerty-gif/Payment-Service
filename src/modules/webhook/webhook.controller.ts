import {
  Body,
  Controller,
  Headers,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import {
  successResponse,
  failResponse,
} from '../../common/util/response.handler';
import { WebhookSignatureGuard } from '../../common/guards/webhook-signature.guard';
import { RAZORPAY_HEADERS } from '../payment/constants/payment.constants';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('payment')
  @UseGuards(WebhookSignatureGuard)
  @ApiOperation({
    summary: 'Payment webhook callback',
    description:
      'Receives signed gateway webhook and updates payment status according to payload.',
  })
  @ApiHeader({
    name: 'x-razorpay-signature',
    required: true,
    description: 'HMAC SHA256 signature generated with webhook secret.',
  })
  @ApiBody({ type: WebhookEventDto })
  @ApiOkResponse({
    description: 'Webhook processed.',
    schema: {
      example: {
        error: false,
        message: 'Webhook processed successfully.',
        status: 200,
        data: {
          eventId: 'evt_fail_001',
          processedAt: '2026-05-09T15:20:17.507Z',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing webhook signature.',
  })
  @ApiBadRequestResponse({ description: 'Invalid webhook payload.' })
  async receiveWebhook(
    @Body() body: WebhookEventDto,
    @Headers(RAZORPAY_HEADERS.SIGNATURE) signature: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const event = await this.webhookService.processWebhook(body, signature);
      await successResponse(
        'Webhook processed successfully.',
        event,
        response,
        200,
      );
    } catch (error) {
      await failResponse(true, (error as Error).message, response, 400);
    }
  }
}
