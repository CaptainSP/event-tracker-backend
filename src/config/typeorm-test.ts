import { TypeOrmModule } from '@nestjs/typeorm';

import * as dotnev from 'dotenv';
dotnev.config();

export const TypeOrmTest = (entities: any[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST_TEST,
    port: 5432,
    database: process.env.POSTGRES_DB_TEST,
    username: process.env.POSTGRES_USER_TEST,
    password: process.env.POSTGRES_PASSWORD_TEST,
    synchronize: true,
    logging: false,
    // get from file system
    entities: entities,
    subscribers: [],
    autoLoadEntities: true,
    dropSchema: true,
  });
