import { Tag } from "src/controllers/tags/entities/tag.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    summary: string;

    @Column({
        nullable: true
    })
    location: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    priority: number;

    @Column()
    user_id: string;

    @Column({
        nullable: true
    })
    imageUrl: string;

    @ManyToMany(() => Tag, tag => tag.events)
    @JoinTable()
    tags: Tag[];
}
