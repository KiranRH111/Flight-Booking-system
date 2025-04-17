
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Flight } from './flight.entity';


@Entity('seat_classes')
export class SeatClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ['ECONOMY', 'BUSINESS', 'FIRST'],
    })
    class: string;

    @Column()
    availableSeats: number;

    @Column('decimal')
    fare: number;

    @ManyToOne(() => Flight)
    flight: Flight;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}