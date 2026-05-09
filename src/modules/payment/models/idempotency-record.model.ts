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
  tableName: 'payment_idempotency_records',
  timestamps: true,
})
export class IdempotencyRecord extends Model<IdempotencyRecord> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(128))
  key: string;

  @AllowNull(false)
  @Column(DataType.STRING(128))
  requestHash: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  response: Record<string, any>;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  statusCode: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt: Date;
}
