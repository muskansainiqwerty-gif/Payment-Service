import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Channel, Connection, ConsumeMessage, Options, connect } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleDestroy {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async getChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }
    this.connection = await connect(process.env.RABBIT_MQ);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async assertQueue(
    queueName: string,
    options: Options.AssertQueue = { durable: true },
  ): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertQueue(queueName, options);
  }

  async sendToQueue(
    queueName: string,
    payload: Record<string, any>,
    options: Options.Publish = { persistent: true },
  ): Promise<boolean> {
    const channel = await this.getChannel();
    return channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(payload)),
      options,
    );
  }

  async consume(
    queueName: string,
    handler: (message: ConsumeMessage) => Promise<void>,
    options: Options.Consume = { noAck: false },
  ): Promise<void> {
    const channel = await this.getChannel();
    await channel.consume(
      queueName,
      async (message) => {
        if (!message) {
          return;
        }
        await handler(message);
      },
      options,
    );
  }

  async prefetch(count: number): Promise<void> {
    const channel = await this.getChannel();
    await channel.prefetch(count);
  }

  async ack(message: ConsumeMessage): Promise<void> {
    const channel = await this.getChannel();
    channel.ack(message);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
