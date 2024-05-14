import { Alert, Box, CircularProgress, LinearProgress, Stack } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Atom, useAtom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { PropsWithChildren, ReactNode } from 'react'
import { getErrorMessage } from '../../backend/util/get-error-message'

type RenderLoadableAtomProps<T> = {
  atom: Atom<Loadable<Promise<T | undefined>>>
  render: (data: T) => JSX.Element
  title?: string | ReactNode
  progress?: 'circular' | 'linear'
}

function NotLoaded({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
  return (
    <Stack>
      <Box>{title}</Box>
      {children}
    </Stack>
  )
}

export function RenderLoadableAtom<T>({ atom, render, title, progress = 'circular' }: RenderLoadableAtomProps<T>) {
  const [value] = useAtom(atom)
  if (value.state === 'loading')
    return <NotLoaded title={title}>{progress === 'circular' ? <CircularProgressLoader /> : <LinearProgressLoader />}</NotLoaded>
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

function LinearProgressLoader() {
  return (
    <LinearProgress
      sx={{
        '&.MuiLinearProgress-root': {
          color: `${blueGrey[800]} !important`,
        },
      }}
    />
  )
}

function CircularProgressLoader() {
  return (
    <CircularProgress
      sx={{
        marginTop: 1,
      }}
    />
  )
}

export function RenderAtom<T>({ atom, render }: RenderAtomProps<T>) {
  const [value] = useAtom(atom)
  if (!value) return null

  return render(value)
}
