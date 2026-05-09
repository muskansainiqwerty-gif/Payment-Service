import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../constants';
import { Payment } from './models/payment.model';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaginatePaymentDto } from './dto/paginate-payment.dto';

@Injectable()
export class PaymentRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  async createPayment(payload: Partial<Payment>): Promise<Payment> {
    return Payment.create(payload as any);
  }

  async findById(id: string): Promise<Payment | null> {
    return Payment.findByPk(id);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return Payment.findOne({ where: { orderId } });
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Payment | null> {
    return Payment.findOne({ where: { idempotencyKey } });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    updateFields: Partial<Payment> = {},
  ): Promise<void> {
    await Payment.update({ status, ...updateFields }, { where: { id } });
  }

  async paginateByUserId(userId: string, query: PaginatePaymentDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
    const { rows, count } = await Payment.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
    return { rows, count, page, limit };
  }
}
