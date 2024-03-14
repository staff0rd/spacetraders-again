import { Migrator } from '@mikro-orm/migrations'
import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import dotenv from 'dotenv'

dotenv.config()

const config: Options = {
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  driver: PostgreSqlDriver,
  dbName: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!),
  // folder-based discovery setup, using common filename suffix
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug mode to log SQL queries and discovery information
  debug: true,
  extensions: [Migrator],
  tsNode: true,
}

export default config
