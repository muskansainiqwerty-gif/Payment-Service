import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class WebhookEventDto {
  @ApiProperty({ example: 'evt_1710000000' })
  @IsString()
  eventId: string;

  @ApiPropertyOptional({ example: 'MB_1778339296927_128' })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    example: 'failed',
    description: 'Use success or failed to update payment status.',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: { reason: 'insufficient_funds' },
  })
  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;
}
