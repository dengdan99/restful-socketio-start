import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class Base {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ name: 'created_at'})
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at'})
    UpdatedAt!: Date;
}