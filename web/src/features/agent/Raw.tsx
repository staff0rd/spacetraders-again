import { Atom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { RenderLoadableAtom } from './RenderLoadableAtom'

type Props =
  | {
      atom: Atom<Loadable<Promise<unknown | undefined>>>
    }
  | { json: object }
export const Raw = (props: Props) =>
  'atom' in props ? (
    <RenderLoadableAtom atom={props.atom} render={(data) => <JsonView src={data} />} title="Raw" />
  ) : (
    <JsonView src={props.json} />
  )
