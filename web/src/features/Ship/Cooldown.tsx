import { ObjectValues } from './ObjectValues'
import { RenderShipsAtom } from './RenderShipsAtom'

export function Cooldown() {
  return <RenderShipsAtom card render={(ship) => <ObjectValues object={ship.cooldown} />} />
}
