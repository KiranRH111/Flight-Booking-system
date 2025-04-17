import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { Flight } from 'src/entities/flight.entity';
import { Booking } from 'src/entities/bookings.entity';
import { SeatClass } from 'src/entities/seat-class.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(SeatClass)
    private seatClassRepository: Repository<SeatClass>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ message: string }> {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return { message: 'User created successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to create user. Please try again.');
    }
  }


  async searchFlights(from: string, to: string, date: Date): Promise<Flight[]> {
    try {
      const flights = await this.flightRepository.find({
        where: { fromLocation: from, toLocation: to, departureTime: date },
        relations: ['seatClasses'],
      });

      if (!flights.length) {
        throw new NotFoundException('No flights found for the given criteria');
      }

      return flights;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to search flights. Please try again.');
    }
  }

  async getFlightFare(flightId: number, seatClass: string): Promise<SeatClass> {
    const seat = await this.seatClassRepository.findOne({
      where: {
        flight: { id: flightId },
        class: seatClass,
      },
      relations: ['flight'],
    });

    if (!seat) throw new NotFoundException('Fare not found');
    return seat;
  }

  async bookFlight(userId: number, flightId: number, seatClassType: string): Promise<Booking> {
    try {

      const user = await this.userRepository.findOne({ where: { id: userId } });
      const flight = await this.flightRepository.findOne({ where: { id: flightId }, relations: ['seatClasses'] });

      if (!user || !flight) throw new NotFoundException('User or Flight not found');

      const seatClass = flight.seatClasses.find(sc => sc.class === seatClassType);
      if (!seatClass || seatClass.availableSeats <= 0) {
        throw new BadRequestException('No seats available in selected class');
      }

      // Check if seat is already booked
      const existingBooking = await this.bookingRepository.findOne({
        where: {
          flight: { id: flightId },
          seatClass: seatClassType,
          seatNumber: `${seatClassType}-${seatClass?.availableSeats}`
        }
      });

      if (existingBooking) {
        throw new ConflictException('This seat is already booked. Please try another seat.');
      }

      const booking = this.bookingRepository.create({
        user,
        flight,
        seatClass: seatClassType,
        seatNumber: `${seatClassType}-${seatClass.availableSeats}`,
        fare: seatClass.fare,
        bookingDate: new Date(),
      });

      seatClass.availableSeats--;
      await this.seatClassRepository.save(seatClass);
      return await this.bookingRepository.save(booking);
      
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to book flight. Please try again later.');
    }
  }

  async viewBookings(userId: number): Promise<Booking[]> {
    try {
      const bookings = await this.bookingRepository.find({
        where: { user: { id: userId } },
        relations: ['flight'],
      });

      if (!bookings.length) {
        throw new NotFoundException('No bookings found for this user');
      }

      return bookings;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve bookings. Please try again.');
    }
  }

  async cancelBooking(userId: number, bookingId: number): Promise<{ message: string }> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ['flight', 'flight.seatClasses'],
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const seatClass = booking.flight.seatClasses.find(sc => sc.class === booking.seatClass);
      if (seatClass) {
        seatClass.availableSeats++;
        await this.seatClassRepository.save(seatClass);
      }

      await this.bookingRepository.remove(booking);
      return { message: 'Booking cancelled successfully' };
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel booking. Please try again.');
    }
  }



  async addFlight(flightNumber: string, from: string, to: string, departure: Date): Promise<{ message: string }> {
    try {
      const existingFlight = await this.flightRepository.findOne({
        where: { flightNumber, departureTime: departure },
      });

      if (existingFlight) {
        throw new ConflictException('Flight with the same number and departure time already exists');
      }

      const flight = this.flightRepository.create({
        flightNumber,
        fromLocation: from,
        toLocation: to,
        departureTime: departure,
        status: 'ON_TIME',
      });

      await this.flightRepository.save(flight);
      return { message: 'Flight added successfully' };
      
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to add flight. Please try again.');
    }
  }



  async updateStatus(flightId: number, status: string): Promise<{ message: string }> {
    try {
      const flight = await this.flightRepository.findOne({ where: { id: flightId } });

      if (!flight) {
        throw new NotFoundException('Flight not found');
      }

      if (!['ON_TIME', 'DELAYED', 'CANCELLED'].includes(status)) {
        throw new BadRequestException('Invalid flight status');
      }

      flight.status = status;
      await this.flightRepository.save(flight);
      return { message: `Flight status updated to ${status} successfully` };
      
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update flight status. Please try again.');
    }
  }


  async addSeatClasses(
    flightId: number,
    seatClasses: { class: string; availableSeats: number; fare: number }[],
  ): Promise<{ message: string }> {
    try {
      const flight = await this.flightRepository.findOne({ where: { id: flightId } });
      if (!flight) throw new NotFoundException('Flight not found');

      // Validate seat class types
      const validClasses = ['ECONOMY', 'BUSINESS', 'FIRST'];
      seatClasses.forEach(seat => {
        if (!validClasses.includes(seat.class)) {
          throw new BadRequestException(`Invalid seat class type: ${seat.class}`);
        }
      });

      const newSeatClasses = seatClasses.map(data =>
        this.seatClassRepository.create({
          ...data,
          flight,
        }),
      );

      await this.seatClassRepository.save(newSeatClasses);
      return { message: 'Seat classes added successfully' };
      
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add seat classes. Please try again.');
    }
  }


  async setFare(flightId: number, classType: string, newFare: number): Promise<{ message: string }> {
    try {
      const seat = await this.seatClassRepository.findOne({
        where: {
          flight: { id: flightId },
          class: classType,
        },
        relations: ['flight'],
      });

      if (!seat) throw new NotFoundException('Seat class not found for this flight');
      if (newFare <= 0) throw new BadRequestException('Fare must be greater than 0');

      seat.fare = newFare;
      await this.seatClassRepository.save(seat);
      return { message: `Fare updated successfully for ${classType} class` };
      
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update fare. Please try again.');
    }
  }

  async getFare(flightId: number, classType: string): Promise<SeatClass> {
    try {
      const seat = await this.seatClassRepository.findOne({
        where: {
          flight: { id: flightId },
          class: classType,
        },
        relations: ['flight'],
      });

      if (!seat) throw new NotFoundException('Fare info not found');
      return seat;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve fare information. Please try again.');
    }
  }
}