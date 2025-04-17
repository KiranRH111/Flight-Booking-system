import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

import { Flight } from './entities/flight.entity';
import { SeatClass } from './entities/seat-class.entity';
import { UserModule } from './user/user.module';
import { Booking } from './entities/bookings.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [User, Booking, Flight, SeatClass],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule
  ],
})
export class AppModule {}
