import { formatDistance } from 'date-fns'
import { Ship } from '../../../../api'

export const getCurrentFlightTime = (ship: Ship) => {
  const departure = new Date(ship.nav.route.departureTime)
  const arrival = new Date(ship.nav.route.arrival)

  const distance = formatDistance(arrival, new Date(), { addSuffix: true })
  const flightTimeSeconds = (arrival.getTime() - departure.getTime()) / 1000
  const flightTimeFromNowSeconds = (arrival.getTime() - new Date().getTime()) / 1000
  return { flightTimeFromNowSeconds, distance }
}
