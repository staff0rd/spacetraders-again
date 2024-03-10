export const getConfig = () => ({
  influx: {
    url: process.env.INFLUX_URL!,
    token: process.env.INFLUX_TOKEN!,
    org: process.env.INFLUX_ORG!,
    bucket: process.env.INFLUX_BUCKET!,
  },
})
