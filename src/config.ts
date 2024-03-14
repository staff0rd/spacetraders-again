import dotenv from 'dotenv'

dotenv.config()

export const getConfig = () => ({
  influx: {
    url: process.env.INFLUX_URL!,
    token: process.env.INFLUX_TOKEN!,
    org: process.env.INFLUX_ORG!,
    bucket: process.env.INFLUX_BUCKET!,
  },
  redis: {
    host: process.env.REDIS_HOST!,
  },
  postgres: {
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
  },
  logging: {
    host: process.env.SEQ_HOST!,
  },
})
