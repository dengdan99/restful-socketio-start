import { Entity, Column } from 'typeorm'

import { Length } from 'class-validator'
import { Base } from './base';


@Entity()
export class Master extends Base {

    @Column({
        type: 'varchar',
        length: 80
    })
    @Length(3, 80, { message: '登陆名长度 3 - 24 字节' })
    name: string;

    @Column({
        length: 16
    })
    @Length(6, 16)
    password: string;

    @Column({
        length: 11
    })
    mobile: string;
}

export const masterSchema = {
    name: { type: 'string', required: true, example: 'leo' },
    password: { type: 'string', required: true, example: '123456' },
    mobile: { type: 'string', required: true, example: '13666666666' }
}
