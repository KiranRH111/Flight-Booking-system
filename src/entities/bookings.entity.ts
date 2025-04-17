import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Flight } from './flight.entity';


@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.bookings)
    user: User;

    @ManyToOne(() => Flight, flight => flight.bookings)
    flight: Flight;

    @Column()
    seatClass: string;

    @Column()
    seatNumber: string;

    @Column('decimal')
    fare: number;

    @Column({ default: 'CONFIRMED' })
    status: string;

    @Column()
    bookingDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}