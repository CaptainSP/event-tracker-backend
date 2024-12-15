import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Mail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    outlookId:string;

    @Column()
    subject:string;

    @Column()
    body:string;

    @Column()
    sender:string;

    @Column()
    senderName:string;

    @Column({
        default:false
    })
    fail:boolean;

    @Column({
        default:false
    })
    success:boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
