import { Global, Module } from "@nestjs/common";
import { MyService } from "./redis.service";
import { RedisModule } from "@liaoliaots/nestjs-redis";
import { ConfigService } from "@nestjs/config";
@Global()
@Module({
  imports: [
    RedisModule.forRootAsync(
      {
        useFactory: (configService: ConfigService) => {
          return {
            config: {
              url: configService.get("REDIS_URL"),
              username: configService.get("REDIS_USER"),
              password: configService.get("REDIS_PASS"),
            },
          };
        },
        inject: [ConfigService],
      },
      true
    ),
  ],
  providers: [MyService],
  exports: [MyService],
})
export class RedisModules { }
