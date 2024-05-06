import { TradeSymbol } from '../../../api'
import { invariant } from '../../../invariant'
import { log } from '../../../logging/configure-logging'
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

    if (!waypoint) {
      log.warn('ship', `${ship.label} could not find a waypoint for ${tradeSymbol}`)
      return false
    }

    const tradeGood = waypoint.tradeGoods!.find((x) => x.symbol === tradeSymbol)
    invariant(tradeGood, `Expected to find a tradeGood for ${tradeSymbol}`)
    const cost = tradeGood.purchasePrice * unitsRequired
    const reward = agent.contract.terms.payment.onAccepted + agent.contract.terms.payment.onFulfilled
    if (cost > reward) {
      log.warn('ship', `${ship.label} will lose ${Math.abs(reward - cost).toLocaleString()} credits on contract for ${tradeSymbol}`)
    } else {
      log.info('ship', `${ship.label} will gain ${Math.abs(reward - cost).toLocaleString()} credits on contract for ${tradeSymbol}`)
    }

    const toBuy = Math.min(unitsToGo, ship.cargo.capacity, tradeGood.tradeVolume)
    const priceNow = toBuy * tradeGood.purchasePrice
    if (priceNow > agent.data.credits) {
      log.warn('ship', `${ship.label} cannot afford ${priceNow.toLocaleString()} credits for ${toBuy} ${tradeSymbol}`)
      return false
    }

    if (ship.nav.waypointSymbol !== waypoint.symbol) {
      await act.navigateShip(ship, waypoint)
      return true
    } else {
      await act.scanMarketIfNeccessary(ship)

      await act.purchaseGoods(ship, tradeSymbol as TradeSymbol, toBuy)
      return true
    }
  }
