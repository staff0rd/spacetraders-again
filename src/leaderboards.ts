import { DefaultApiFactory } from '../api'
import chalk from 'chalk'
import { print } from './print'
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { getConfig } from './config'
import { hostname } from 'os'

export async function leaderboards() {
  const { url, token, org, bucket } = getConfig().influx
  const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms')
  writeApi.useDefaultTags({ location: hostname() })
  const result = await DefaultApiFactory().getStatus()

  print(chalk.underline.inverse('Leaderboards\n'))

  print(chalk.underline('Most credits\n'))
  result.data.leaderboards.mostCredits.forEach((x, i) => {
    writeApi.writePoint(new Point('most-credits').tag('agent', x.agentSymbol).floatField('credits', x.credits))
    print(`${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.credits.toLocaleString().padEnd(15)} ${x.agentSymbol}`)
  })

  print(chalk.underline('\nMost submitted charts\n'))
  result.data.leaderboards.mostSubmittedCharts.forEach((x, i) => {
    writeApi.writePoint(new Point('most-submitted-charts').tag('agent', x.agentSymbol).floatField('chart-count', x.chartCount))
    print(`${`${i + 1}.`.toLocaleString().padEnd(3)} ${x.chartCount.toLocaleString().padEnd(8)} ${x.agentSymbol}`)
  })

  await writeApi.close()
}
