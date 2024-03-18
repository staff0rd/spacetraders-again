import { Ship, Shipyard } from '../../../../api'
import { apiFactory } from '../apiFactory'

export const getOrPurchaseMiningDrone = async (api: ReturnType<typeof apiFactory>, myShips: Ship[], shipyard: Shipyard) => {
  if (myShips.length === 2) {
    const {
      data: {
        data: { ship },
      },
    } = await api.fleet.purchaseShip({ shipType: 'SHIP_MINING_DRONE', waypointSymbol: shipyard.symbol })
    return ship
  } else {
    return myShips.find((s) => s.frame.symbol === 'FRAME_DRONE')!
  }
}
