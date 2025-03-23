import lodash from 'lodash'
import { ActivityLevel, Agent, Contract, Extraction, MarketTradeGood, MarketTransaction, ShipyardTransaction, SupplyLevel } from '../../api'
import { getEntityManager } from '../../orm'
import { AgentEntity } from '../status/agent.entity'
import { TimeSeriesDataEntity } from './time-series-data.entity'

export const writePoint = <T, K extends keyof T>(
  object: T,
  {
    measurementName,
    tags,
    fields,
    resetDate,
    agentSymbol,
    timestamp = new Date().toISOString(),
  }: {
    measurementName: string
    tags: K[]
    fields: K[]
    resetDate: string
    agentSymbol: string
    timestamp?: string
  },
) => {
  const tagsObj = lodash.pick(object, tags) as Record<string, string>
  const fieldsObj = lodash.pick(object, fields) as Record<string, number | string>

  const timeSeriesPoint = new TimeSeriesDataEntity({
    timestamp: new Date(timestamp),
    resetDate,
    agentSymbol,
    measurementName,
    tags: tagsObj,
    fields: fieldsObj,
  })

  // Persist to the database
  const em = getEntityManager().fork()
  em.persistAndFlush(timeSeriesPoint)
}

export const writeMyMarketTransaction = (resetDate: string, transaction: MarketTransaction, agent: Agent) => {
  writeMarketTransaction(transaction, resetDate, agent.symbol)
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

export const writeShipyardTransaction = (resetDate: string, transaction: ShipyardTransaction, agent: Agent) => {
  writePoint(transaction, {
    measurementName: 'shipyard-transaction',
    tags: ['waypointSymbol', 'shipSymbol', 'shipType'],
    fields: ['price'],
    resetDate,
    agentSymbol: agent.symbol,
  })
  writeCredits(agent, resetDate)
}

export function writeMarketTransaction(transaction: MarketTransaction, resetDate: string, agentSymbol: string) {
  writePoint(transaction, {
    measurementName: 'market-transaction',
    tags: ['waypointSymbol', 'shipSymbol', 'tradeSymbol', 'type'],
    fields: ['units', 'pricePerUnit', 'totalPrice'],
    resetDate,
    agentSymbol,
    timestamp: transaction.timestamp,
  })
}

const SupplyLevelMap: Record<SupplyLevel, number> = {
  [SupplyLevel.Scarce]: 0,
  [SupplyLevel.Limited]: 1,
  [SupplyLevel.Moderate]: 2,
  [SupplyLevel.High]: 3,
  [SupplyLevel.Abundant]: 4,
}

const ActivityLevelMap: Record<ActivityLevel | 'NONE', number> = {
  ['NONE']: 0,
  [ActivityLevel.Weak]: 1,
  [ActivityLevel.Restricted]: 2,
  [ActivityLevel.Growing]: 2,
  [ActivityLevel.Strong]: 4,
}

export function writeMarketTradeGood(tradeGood: MarketTradeGood, resetDate: string, agentSymbol: string, waypointSymbol: string) {
  const activityLevel = ActivityLevelMap[tradeGood.activity ?? 'NONE']
  const supplyLevel = SupplyLevelMap[tradeGood.supply]
  writePoint(
    { ...tradeGood, waypointSymbol, activityLevel, supplyLevel },
    {
      measurementName: 'trade-good',
      tags: ['symbol', 'type', 'supply', 'waypointSymbol'],
      fields: ['tradeVolume', 'sellPrice', 'purchasePrice', 'activityLevel', 'supplyLevel'],
      resetDate,
      agentSymbol,
    },
  )
}

export function writeContract(contract: Contract, resetDate: string, agentSymbol: string) {
  const {
    factionSymbol,
    type,
    terms: {
      deadline,
      payment: { onAccepted, onFulfilled },
      deliver,
    },
    deadlineToAccept,
  } = contract

  const { destinationSymbol, tradeSymbol, unitsRequired } = deliver![0]
  const payload = {
    factionSymbol,
    type,
    deadline,
    onAccepted,
    onFulfilled,
    deadlineToAccept,
    destinationSymbol,
    tradeSymbol,
    unitsRequired,
  }
  writePoint(payload, {
    measurementName: 'contract',
    tags: ['factionSymbol', 'type', 'destinationSymbol', 'tradeSymbol'],
    fields: ['unitsRequired', 'deadline', 'onAccepted', 'onFulfilled', 'deadlineToAccept'],
    resetDate,
    agentSymbol,
  })
}

// Additional functions for stats and leaderboard data currently written directly in get-status.ts
export const writeStats = (stats: { agents: number; ships: number; systems: number; waypoints: number }, resetDate: string) => {
  const timeSeriesPoint = new TimeSeriesDataEntity({
    timestamp: new Date(),
    resetDate,
    agentSymbol: 'GLOBAL',
    measurementName: 'stats',
    tags: { resetDate },
    fields: stats,
  })

  const em = getEntityManager().fork()
  em.persistAndFlush(timeSeriesPoint)
}

export const writeMostCredits = (agentSymbol: string, credits: number, resetDate: string) => {
  const timeSeriesPoint = new TimeSeriesDataEntity({
    timestamp: new Date(),
    resetDate,
    agentSymbol,
    measurementName: 'most-credits',
    tags: {
      resetDate,
      agent: agentSymbol,
    },
    fields: { credits },
  })

  const em = getEntityManager().fork()
  em.persistAndFlush(timeSeriesPoint)
}

export const writeMostSubmittedCharts = (agentSymbol: string, chartCount: number, resetDate: string) => {
  const timeSeriesPoint = new TimeSeriesDataEntity({
    timestamp: new Date(),
    resetDate,
    agentSymbol,
    measurementName: 'most-submitted-charts',
    tags: {
      resetDate,
      agent: agentSymbol,
    },
    fields: { chartCount },
  })

  const em = getEntityManager().fork()
  em.persistAndFlush(timeSeriesPoint)
}

// Function to help with batching multiple writes
export const flushWrites = async () => {
  const em = getEntityManager().fork()
  await em.flush()
}
