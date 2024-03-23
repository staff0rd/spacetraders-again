import { formatDistance } from 'date-fns'
import { ShipEntity } from '../../ship/ship.entity'

export function timeUntil(value: Date | string) {
  const date = new Date(value)
  const relative = formatDistance(date, new Date(), { addSuffix: true })
  const seconds = (date.getTime() - new Date().getTime()) / 1000
  return { seconds, distance: relative }
}

export const shipArriving = (ship: ShipEntity) => {
  return timeUntil(ship.nav.route.arrival)
}

export const shipCooldownRemaining = (ship: ShipEntity) => {
  if (!ship.cooldown.expiration) return { seconds: 0, distance: '0 seconds' }
  return timeUntil(ship.cooldown.expiration)
}
