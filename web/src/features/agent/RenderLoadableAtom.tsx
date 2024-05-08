import { Alert, Box, CircularProgress, Stack } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Atom, useAtom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { PropsWithChildren } from 'react'
import { getErrorMessage } from '../../backend/util/get-error-message'

type RenderLoadableAtomProps<T> = {
  atom: Atom<Loadable<Promise<T | undefined>>>
  render: (data: T) => JSX.Element
  title: string
}

function NotLoaded({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <Stack>
      <Box>{title}</Box>
      {children}
    </Stack>
  )
}

export function RenderLoadableAtom<T>({ atom, render, title }: RenderLoadableAtomProps<T>) {
  const [value] = useAtom(atom)
  if (value.state === 'loading')
    return (
      <NotLoaded title={title}>
        <CircularProgress
          sx={{
            '&.MuiCircularProgress-root': {
              color: `${blueGrey[800]} !important`,
            },
          }}
        />
      </NotLoaded>
    )
  if (value.state === 'hasError')
    return (
      <NotLoaded title={title}>
        <Alert severity="error">{getErrorMessage(value.error)}</Alert>
      </NotLoaded>
    )
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
