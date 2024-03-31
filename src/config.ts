import dotenv from 'dotenv'

dotenv.config()

const getInt = (key: string, defaultValue: number) => {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

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
  logging: {
    host: process.env.SEQ_HOST!,
  },
  purchases: {
    mining: getInt('PURCHASE_MINING_SHIPS', 0),
    shuttles: getInt('PURCHASE_SHUTTLES', 0),
    satelites: getInt('PURCHASE_SATELITES', 0),
  },
})
