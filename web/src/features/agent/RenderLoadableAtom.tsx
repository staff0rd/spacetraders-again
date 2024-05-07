import { Alert, CircularProgress } from '@mui/material'
import { Atom, useAtom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { getErrorMessage } from '../../backend/util/get-error-message'

type RenderLoadableAtomProps<T> = {
  atom: Atom<Loadable<Promise<T | undefined>>>
  render: (data: T) => JSX.Element
}
export function RenderLoadableAtom<T>({ atom, render }: RenderLoadableAtomProps<T>) {
  const [value] = useAtom(atom)
  if (value.state === 'loading') return <CircularProgress />
  if (value.state === 'hasError') return <Alert severity="error">{getErrorMessage(value.error)}</Alert>
  if (!value.data) return null

  return render(value.data!)
}

type RenderAtomProps<T> = {
  atom: Atom<T>
  render: (data: NonNullable<T>) => JSX.Element
}

export function RenderAtom<T>({ atom, render }: RenderAtomProps<T>) {
  const [value] = useAtom(atom)
  if (!value) return null

  return render(value)
}
