import * as dotenv from 'dotenv';
import { DataSource, DefaultNamingStrategy } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

export const ormConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/common/migrations/*.js'],
  migrationsTransactionMode: 'all',
  namingStrategy: new DefaultNamingStrategy(),
  synchronize: true,
};

export default new DataSource(ormConfig);
