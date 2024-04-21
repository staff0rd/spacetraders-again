import dotenv from 'dotenv'

dotenv.config()

const getInt = (key: string, defaultValue: number) => {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

const getBool = (key: string, defaultValue: boolean) => {
  const value = process.env[key]
  return value ? value === 'true' : defaultValue
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
    surveyors: getInt('PURCHASE_SURVEYORS', 0),
  },
  strategy: {
    scanOnStartup: getBool('SHOULD_SCAN_ON_STARTUP', true),
    mine: getBool('SHOULD_MINE', true),
  },
})
