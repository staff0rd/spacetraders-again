import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { hostname } from 'os'
import { DefaultApiFactory } from '../../../api'
import { getConfig } from '../../config'
import { findOrCreateStatus } from '../../db/findOrCreateStatus'
import { log } from '../../logging/configure-logging'

export async function getStatus(context: string) {
  const { url, token, org, bucket } = getConfig().influx
  const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms')
  writeApi.useDefaultTags({ location: hostname() })

  const result = await DefaultApiFactory().getStatus()

  await findOrCreateStatus(result.data.resetDate)

  const resetDate = result.data.resetDate

  writeApi.writePoint(
    new Point('stats')
      .tag('reset-date', resetDate)
      .floatField('agents', result.data.stats.agents)
      .floatField('ships', result.data.stats.ships)
      .floatField('systems', result.data.stats.systems)
      .floatField('waypoints', result.data.stats.waypoints),
  )

  result.data.leaderboards.mostCredits.forEach((x, i) => {
    writeApi.writePoint(new Point('most-credits').tag('agent', x.agentSymbol).tag('reset-date', resetDate).floatField('credits', x.credits))
  })

  result.data.leaderboards.mostSubmittedCharts.forEach((x, i) => {
    writeApi.writePoint(
      new Point('most-submitted-charts').tag('agent', x.agentSymbol).tag('reset-date', resetDate).floatField('chart-count', x.chartCount),
    )
  })

  await writeApi.close()

  log.info('stats', 'Wrote stats')
}
