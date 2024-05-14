import { Atom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { RenderLoadableAtom } from './RenderLoadableAtom'

type Props = {
  atom: Atom<Loadable<Promise<unknown | undefined>>>
}
export const Raw = ({ atom }: Props) => <RenderLoadableAtom atom={atom} render={(data) => <JsonView src={data} />} title="Raw" />
