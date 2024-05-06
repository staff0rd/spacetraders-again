import lodash from 'lodash'
import { TradeSymbol } from '../../../api'
import { WaypointEntity } from '../../waypoints/waypoint.entity'

export const getBestSellWaypoint = (waypoints: WaypointEntity[], tradeGood: TradeSymbol) => {
  const buyers = waypoints.filter((x) => (x.tradeGoods || []).some((y) => y.symbol === tradeGood))
  const sortedBySellPrice = lodash.orderBy(buyers, (x) => x.tradeGoods!.find((y) => y.symbol === tradeGood)!.sellPrice, 'desc')
  return sortedBySellPrice[0]
}
