import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client'
import lodash from 'lodash'
import { hostname } from 'os'
import { Agent, Extraction, MarketTransaction } from '../../../api'
import { getConfig } from '../../config'
import { AgentEntity } from './agent.entity'

let writeApi: WriteApi | undefined
export const influxWrite = () => {
  if (!writeApi) {
    const { url, token, org, bucket } = getConfig().influx
    writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms')
    writeApi.useDefaultTags({ location: hostname() })
  }
  return writeApi
}

export const writePoint = <T, K extends keyof T>(
  object: T,
  {
    measurementName,
    tags,
    fields,
    resetDate,
    agentSymbol,
  }: { measurementName: string; tags: K[]; fields: K[]; resetDate: string; agentSymbol: string },
) => {
  const point = new Point(measurementName)
  Object.entries(lodash.pick(object, tags)).forEach(([key, value]) => {
    point.tag(key, value as string)
  })
  Object.entries(lodash.pick(object, fields)).forEach(([key, value]) => {
    point.floatField(key, value)
  })
  point.tag('resetDate', resetDate)
  point.tag('agentSymbol', agentSymbol)
  influxWrite().writePoint(point)
}

export const writeMarketTransaction = (resetDate: string, transaction: MarketTransaction, agent: Agent) => {
  writePoint(transaction, {
    measurementName: 'market-transaction',
    tags: ['waypointSymbol', 'shipSymbol', 'tradeSymbol', 'type'],
    fields: ['units', 'pricePerUnit', 'totalPrice'],
    resetDate,
    agentSymbol: agent.symbol,
  })
  writeCredits(agent, resetDate)
}

export const writeCredits = (agent: Pick<Agent, 'symbol' | 'credits'>, resetDate: string) => {
  writePoint(agent, {
    measurementName: 'credits',
    tags: [],
    fields: ['credits'],
    resetDate,
    agentSymbol: agent.symbol,
  })
}

export const writeExtraction = ({ resetDate, data: agent }: Pick<AgentEntity, 'resetDate' | 'data'>, extraction: Extraction) => {
  writePoint(
    {
      shipSymbol: extraction.shipSymbol,
      tradeGood: extraction.yield.symbol,
      units: extraction.yield.units,
    },
    {
      measurementName: 'extraction',
      tags: ['shipSymbol', 'tradeGood'],
      fields: ['units'],
      resetDate,
      agentSymbol: agent!.symbol,
    },
  )
}
