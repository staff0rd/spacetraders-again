import { formatDistance } from 'date-fns'
import { Ship } from '../../../../api'
import { log } from '../../../logging/configure-logging'

export const getCurrentFlightTime = (ship: Ship) => {
  const departure = new Date(ship.nav.route.departureTime)
  const arrival = new Date(ship.nav.route.arrival)

  const distance = formatDistance(arrival, new Date(), { addSuffix: true })
  log.info('agent', `Mining drone arrival ${distance} `)
  const flightTimeSeconds = (arrival.getTime() - departure.getTime()) / 1000
  const flightTimeFromNowSeconds = (arrival.getTime() - new Date().getTime()) / 1000
  return flightTimeFromNowSeconds
}
