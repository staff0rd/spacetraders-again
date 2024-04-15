import { Migrator } from '@mikro-orm/migrations'
import { MySqlDriver, Options } from '@mikro-orm/mysql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import dotenv from 'dotenv'

dotenv.config()

const config: Options = {
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  driver: MySqlDriver,
  dbName: process.env.POSTGRES_DB,
  password: 'mypassword',
  user: 'myuser',
  host: process.env.POSTGRES_HOST,
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
