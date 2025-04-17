import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { Flight } from '../entities/flight.entity';
import { SeatClass } from '../entities/seat-class.entity';
import { Booking } from 'src/entities/bookings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Flight, Booking, SeatClass])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
