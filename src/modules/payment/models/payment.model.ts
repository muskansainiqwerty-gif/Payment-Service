import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import { PaymentStatus } from '../enums/payment-status.enum';

@Table({
  tableName: 'payments',
  timestamps: true,
})
export class Payment extends Model<Payment> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  userId: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(64))
  orderId: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(12, 2))
  amount: number;

  @AllowNull(false)
  @Default('INR')
  @Column(DataType.STRING(3))
  currency: string;

  @AllowNull(false)
  @Default(PaymentStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PaymentStatus)))
  status: PaymentStatus;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING(128))
  idempotencyKey?: string;

  @AllowNull(true)
  @Column(DataType.STRING(128))
  gatewayPaymentId?: string;

  @AllowNull(true)
  @Column(DataType.STRING(128))
  gatewayOrderId?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  failureReason?: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  gatewayResponse?: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.JSON)
  metadata?: Record<string, any>;
}
