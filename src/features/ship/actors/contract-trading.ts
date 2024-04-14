import { TradeSymbol } from '../../../../api'
import { invariant } from '../../../invariant'
import { getActor } from '../../status/actions/getActor'
import { AgentEntity } from '../../status/agent.entity'
import { decisionMaker } from '../../status/decisionMaker'
import { ShipEntity } from '../ship.entity'

const asteroidResult: TradeSymbol[] = ['IRON_ORE', 'ALUMINUM_ORE', 'COPPER_ORE', 'SILICON_CRYSTALS']

export const contractTraderActorFactory = (ship: ShipEntity, agent: AgentEntity, act: Awaited<ReturnType<typeof getActor>>) =>
  decisionMaker(ship, true, agent, act, contractTraderLogicFactory(act))

export const contractTraderLogicFactory =
  (act: Awaited<ReturnType<typeof getActor>>) =>
  async (ship: ShipEntity, agent: AgentEntity): Promise<boolean> => {
    if (!agent.contract || agent.contract.fulfilled) {
      await act.getOrAcceptContract(ship)
      return true
    }

    invariant(agent.contract, 'Expected to have a contract')
    invariant(agent.contract.terms.deliver, 'Expected to have a deliver term')
    invariant(agent.contract.terms.deliver.length === 1, 'Expected to have a single deliver term')

    const { tradeSymbol, unitsFulfilled, unitsRequired } = agent.contract.terms.deliver[0]
    const unitsToGo = unitsRequired - unitsFulfilled

    if (unitsFulfilled === unitsRequired) {
      await act.fulfillContract()
      return true
    }

    // get it from mining instead
    if (asteroidResult.includes(tradeSymbol as TradeSymbol)) return false

    // finish whatever was occuring before
    if (ship.cargo.inventory.filter((x) => x.symbol !== tradeSymbol).length > 0) return false

    if (ship.cargo.capacity === ship.cargo.units || ship.cargo.units >= unitsToGo) {
      await act.deliverContractGoods(ship)
      return true
    }

    const waypoint = await act.findTradeSymbol(tradeSymbol as TradeSymbol)
    invariant(waypoint, `Expected to find a waypoint for ${tradeSymbol}`)

    if (ship.nav.waypointSymbol !== waypoint.symbol) {
      await act.navigateShip(ship, waypoint)
      return true
    } else {
      const tradeGood = waypoint.tradeGoods!.find((x) => x.symbol === tradeSymbol)
      invariant(tradeGood, `Expected to find a tradeGood for ${tradeSymbol}`)
      await act.purchaseGoods(ship, tradeSymbol as TradeSymbol, Math.min(unitsToGo, ship.cargo.capacity, tradeGood.tradeVolume))
      return true
    }
  }
