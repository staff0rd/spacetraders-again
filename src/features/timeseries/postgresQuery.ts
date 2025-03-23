import { FilterQuery } from '@mikro-orm/core'
import { getEntityManager } from '../../orm'
import { TimeSeriesDataEntity } from './time-series-data.entity'

/**
 * Query time series data with various filtering options
 */
export const queryTimeSeries = async (options: {
  measurementName: string
  resetDate?: string
  agentSymbol?: string
  startTime?: Date
  endTime?: Date
  tags?: Record<string, string>
  limit?: number
  offset?: number
}) => {
  const { measurementName, resetDate, agentSymbol, startTime, endTime, tags, limit = 100, offset = 0 } = options

  const whereClause: FilterQuery<TimeSeriesDataEntity> & Record<`tags.${string}`, string> = { measurementName }

  if (resetDate) {
    whereClause.resetDate = resetDate
  }

  if (agentSymbol) {
    whereClause.agentSymbol = agentSymbol
  }

  if (startTime || endTime) {
    whereClause.timestamp = {}
    if (startTime) {
      whereClause.timestamp.$gte = startTime
    }
    if (endTime) {
      whereClause.timestamp.$lte = endTime
    }
  }

  if (tags && Object.keys(tags).length > 0) {
    // For each tag, add a JSONB condition to filter
    Object.entries(tags).forEach(([key, value]) => {
      whereClause[`tags.${key}`] = value
    })
  }

  const em = getEntityManager().fork()

  // Use QueryBuilder for more complex queries if needed
  const results = await em.find(TimeSeriesDataEntity, whereClause, {
    limit,
    offset,
    orderBy: { timestamp: 'DESC' },
  })

  return results
}

/**
 * Get credit history for a specific agent
 */
export const getCreditsHistory = async (
  agentSymbol: string,
  resetDate: string,
  options: { limit?: number; startTime?: Date; endTime?: Date } = {},
) => {
  const { limit = 100, startTime, endTime } = options

  return queryTimeSeries({
    measurementName: 'credits',
    resetDate,
    agentSymbol,
    startTime,
    endTime,
    limit,
  })
}

/**
 * Get top agents by credits
 */
export const getTopAgentsByCredits = async (resetDate: string, limit = 10) => {
  return queryTimeSeries({
    measurementName: 'most-credits',
    resetDate,
    limit,
  })
}

/**
 * Get market transaction history for an agent
 */
export const getMarketTransactions = async (
  agentSymbol: string,
  resetDate: string,
  options: { limit?: number; startTime?: Date; endTime?: Date; waypointSymbol?: string; tradeSymbol?: string } = {},
) => {
  const { limit = 100, startTime, endTime, waypointSymbol, tradeSymbol } = options

  const tags: Record<string, string> = {}
  if (waypointSymbol) {
    tags.waypointSymbol = waypointSymbol
  }
  if (tradeSymbol) {
    tags.tradeSymbol = tradeSymbol
  }

  return queryTimeSeries({
    measurementName: 'market-transaction',
    resetDate,
    agentSymbol,
    startTime,
    endTime,
    tags,
    limit,
  })
}
