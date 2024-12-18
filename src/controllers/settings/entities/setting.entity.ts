import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Setting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    user_id: string;

    @Column()
    settings : string;
}
