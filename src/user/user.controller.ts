import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Booking } from 'src/entities/bookings.entity';
import { Flight } from 'src/entities/flight.entity';
import { SeatClass } from 'src/entities/seat-class.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Search flights between locations
  @Get('/flights/search')
  searchFlights(
    @Query('from') fromLocation: string,
    @Query('to') toLocation: string,
    @Query('date') date: string
  ) {
    return this.userService.searchFlights(fromLocation, toLocation, new Date(date));
  }


  @Post('book-flight')
  async bookFlight(
    @Body('userId') userId: number,
    @Body('flightId') flightId: number,
    @Body('seatClass') seatClass: string,
  ): Promise<Booking> {
    if (!userId || !flightId || !seatClass) {
      throw new BadRequestException('Missing required booking details');
    }
    return this.userService.bookFlight(userId, flightId, seatClass);
  }


  // View booked flights
  @Get('/:userId/bookings')
  getBookedFlights(@Param('userId') userId: string) {
    return this.userService.viewBookings(+userId);
  }

  // Cancel booking
  @Delete('/bookings/:bookingId')
  cancelBooking(
    @Param('bookingId') bookingId: string,
    @Query('userId') userId: string
  ): Promise<{ message: string }> {
    return this.userService.cancelBooking(+userId, +bookingId);
  }

  // Add flight
  @Post('addFlight')
  async addFlight(
    @Body('flightNumber') flightNumber: string,
    @Body('fromLocation') fromLocation: string,
    @Body('toLocation') toLocation: string,
    @Body('departureTime') departureTime: string,
  ): Promise<{ message: string }> {
    if (!flightNumber || !fromLocation || !toLocation || !departureTime) {
      throw new BadRequestException('All fields are required');
    }
    const parsedDeparture = new Date(departureTime);
    if (fromLocation === toLocation) {
      throw new BadRequestException('Source and destination cannot be the same');
    }
    return this.userService.addFlight(flightNumber, fromLocation, toLocation, parsedDeparture);
  }

  // configure flight status
  @Patch(':id/status')
  async updateFlightStatus(
    @Param('id') flightId: number,
    @Body('status') status: string,
  ): Promise<{ message: string }> {
    return this.userService.updateStatus(flightId, status);
  }


  @Post(':id/seat-classes')
  async configureSeatClasses(
    @Param('id') flightId: number,
    @Body('seatClasses') seatClasses: { class: string; availableSeats: number; fare: number }[],
  ): Promise<{ message: string }> {
    const allowedClasses = ['ECONOMY', 'BUSINESS', 'FIRST'];
    
    if (!Array.isArray(seatClasses)) {
      throw new BadRequestException('seatClasses must be an array');
    }

    for (const seatClass of seatClasses) {
      if (
        !seatClass.class ||
        !allowedClasses.includes(seatClass.class) ||
        typeof seatClass.availableSeats !== 'number' ||
        typeof seatClass.fare !== 'number'
      ) {
        throw new BadRequestException('Invalid seat class data');
      }
    }

    return this.userService.addSeatClasses(flightId, seatClasses);
  }


  // set or update fare
  @Patch(':flightId/fare')
  async setOrUpdateFare(
    @Param('flightId') flightId: number,
    @Body('seatClass') seatClass: string,
    @Body('fare') fare: number,
  ): Promise<{ message: string }> {
    const allowed = ['ECONOMY', 'BUSINESS', 'FIRST'];
    if (!allowed.includes(seatClass) || typeof fare !== 'number') {
      throw new BadRequestException('Invalid seat class or fare');
    }

    return this.userService.setFare(flightId, seatClass, fare);
  }

  // get fare
  @Get(':flightId/fare/:seatClass')
  async getFare(
    @Param('flightId') flightId: number,
    @Param('seatClass') seatClass: string,
  ): Promise<SeatClass> {
    return this.userService.getFare(flightId, seatClass);
  }

}
