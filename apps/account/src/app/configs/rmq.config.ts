import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.get('AMQP_EXCHANGE') ?? '',
    connections: [
      {
        login: configService.get('AMQP_USER') ?? '',
        password: configService.get('AMQP_PASSWORD') ?? '',
        host: configService.get('AMQP_HOST') ?? '',
      },
    ],
    queueName: configService.get('AMQP_QUEUE_NAME') ?? '',
    prefetchCount: +configService.get('AMQP_PREFETCH_COUNT') ?? 0,
    serviceName: configService.get('AMQP_SERVICE_NAME') ?? '',
  }),
});
