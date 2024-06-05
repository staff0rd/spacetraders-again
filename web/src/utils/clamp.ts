export function clamp(value: number, minimum: number, maximum: number) {
  if (value < minimum) return minimum
  else if (maximum < value) return maximum
  else return value
}
