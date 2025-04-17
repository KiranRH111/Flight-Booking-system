
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { SeatClass } from './seat-class.entity';
import { Booking } from './bookings.entity';

@Entity('flights')
export class Flight {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    flightNumber: string;

    @Column()
    fromLocation: string;

    @Column()
    toLocation: string;

    @Column()
    departureTime: Date;

    @Column({
        type: 'enum',
        enum: ['ON_TIME', 'DELAYED', 'CANCELLED'],
        default: 'ON_TIME'
    })
    status: string;

    @OneToMany(() => Booking, booking => booking.flight)
    bookings: Booking[];

    @OneToMany(() => SeatClass, seatClass => seatClass.flight)
    seatClasses: SeatClass[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}