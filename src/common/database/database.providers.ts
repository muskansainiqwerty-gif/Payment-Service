import { Sequelize } from 'sequelize-typescript';
import {
  SEQUELIZE,
  DEVELOPMENT,
  STAGE,
  PRODUCTION,
} from '../../constants/index';
import { databaseConfig } from './database.config';
import { Payment } from '../../modules/payment/models/payment.model';
import { WebhookEvent } from '../../modules/payment/models/webhook-event.model';
import { IdempotencyRecord } from '../../modules/payment/models/idempotency-record.model';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.dev;
          break;
        case STAGE:
          config = databaseConfig.stage;
          break;
        case PRODUCTION:
          config = databaseConfig.prod;
          break;
        default:
          config = databaseConfig.dev;
      }

      const sequelize = new Sequelize(config);

      sequelize.addModels([Payment, WebhookEvent, IdempotencyRecord]);

      // await sequelize.sync({ alter: true });

      return sequelize;
    },
  },
];

class DatabaseProvidersAlt {
  sequelize;
  constructor() {
    let config;
    switch (process.env.NODE_ENV) {
      case DEVELOPMENT:
        config = databaseConfig.dev;
        break;
      case STAGE:
        config = databaseConfig.stage;
        break;
      case PRODUCTION:
        config = databaseConfig.prod;
        break;
      default:
        config = databaseConfig.dev;
    }
    this.sequelize = new Sequelize(config);
  }
}

export default new DatabaseProvidersAlt();
