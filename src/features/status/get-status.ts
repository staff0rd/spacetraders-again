import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { hostname } from 'os'
import { DefaultApiFactory } from '../../../api'
import { getConfig } from '../../config'
import { log } from '../../logging/configure-logging'
import { findOrCreateStatus } from './findOrCreateStatus'

export async function getStatus(context: string) {
  const { url, token, org, bucket } = getConfig().influx
  const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms')
  writeApi.useDefaultTags({ location: hostname() })

  const result = await DefaultApiFactory().getStatus()

  await findOrCreateStatus(result.data.resetDate)

  log.info(context, 'Leaderboards')

  log.info(context, 'Most credits', result.data.leaderboards.mostCredits)
  result.data.leaderboards.mostCredits.forEach((x, i) => {
    writeApi.writePoint(new Point('most-credits').tag('agent', x.agentSymbol).floatField('credits', x.credits))
    log.info(context, `${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.credits.toLocaleString().padEnd(15)} ${x.agentSymbol}`)
  })

  log.info(context, 'Most submitted charts')
  result.data.leaderboards.mostSubmittedCharts.forEach((x, i) => {
    writeApi.writePoint(new Point('most-submitted-charts').tag('agent', x.agentSymbol).floatField('chart-count', x.chartCount))
    log.info(context, `${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.chartCount.toLocaleString().padEnd(8)} ${x.agentSymbol}`)
  })

  await writeApi.close()
}
