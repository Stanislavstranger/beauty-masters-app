import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './configs/mongo.config';
/* import { I18nModule } from 'nestjs-i18n';
import { getI18Config } from './configs/i18.config'; */

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'envs/.account.env',
    }),
    /* I18nModule.forRoot(getI18Config()), */
    UserModule,
    AuthModule,
    MongooseModule.forRootAsync(getMongoConfig()),
  ],
})
export class AppModule {}
