import { lineLength } from 'geometric'
import { Position } from '../startup'

export const getClosest = <T extends Position, K extends Position>(points: T[], origin: K): T | undefined => {
  let closest = points[0]
  let closestDistance = Infinity
  for (const object of points) {
    const distance = lineLength([
      [origin.x, origin.y],
      [object.x, object.y],
    ])
    if (distance < closestDistance) {
      closest = object
      closestDistance = distance
    }
  }
  return closest
}
