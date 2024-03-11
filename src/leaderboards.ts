import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { hostname } from 'os'
import { DefaultApiFactory } from '../api'
import { getConfig } from './config'
import { logger } from './logging/configure-logging'

export async function leaderboards() {
  const { url, token, org, bucket } = getConfig().influx
  const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms')
  writeApi.useDefaultTags({ location: hostname() })
  const result = await DefaultApiFactory().getStatus()

  logger.info('Leaderboards')

  logger.info('Most credits', result.data.leaderboards.mostCredits)
  result.data.leaderboards.mostCredits.forEach((x, i) => {
    writeApi.writePoint(new Point('most-credits').tag('agent', x.agentSymbol).floatField('credits', x.credits))
    logger.info(`${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.credits.toLocaleString().padEnd(15)} ${x.agentSymbol}`)
  })

  logger.info('Most submitted charts')
  result.data.leaderboards.mostSubmittedCharts.forEach((x, i) => {
    writeApi.writePoint(new Point('most-submitted-charts').tag('agent', x.agentSymbol).floatField('chart-count', x.chartCount))
    logger.info(`${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.chartCount.toLocaleString().padEnd(8)} ${x.agentSymbol}`)
  })

  await writeApi.close()
}
