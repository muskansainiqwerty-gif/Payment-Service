import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'Premium pass purchase' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: { orderType: 'level-pack' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
