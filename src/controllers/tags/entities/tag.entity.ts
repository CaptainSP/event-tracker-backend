import { Event } from "src/controllers/events/entities/event.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        unique: true
    })
    name: string;

    @ManyToMany(() => Event, event => event.tags)
    events: Event[];
}
