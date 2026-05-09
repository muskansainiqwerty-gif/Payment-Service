import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'payment_webhook_events',
  timestamps: true,
})
export class WebhookEvent extends Model<WebhookEvent> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(128))
  eventId: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  paymentId?: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  signature: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  payload: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.DATE)
  processedAt?: Date;
}
