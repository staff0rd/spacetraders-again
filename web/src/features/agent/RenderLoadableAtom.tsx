import { Alert, Box, LinearProgress, Stack } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import { Atom, useAtom } from 'jotai'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { PropsWithChildren, ReactNode } from 'react'
import { getErrorMessage } from '../../backend/util/get-error-message'
import { CircularProgressLoader } from './CircularProgressLoader'

type BaseProps<T> = {
  atom: Atom<Loadable<Promise<T | undefined>>>
  render: (data: T) => JSX.Element
  progress?: 'circular' | 'linear'
}

type TitleOrId =
  | {
      id?: string
      title: string
    }
  | {
      id: string
      title?: ReactNode
    }
  | {
      id: string
      title?: string
    }

type RenderLoadableAtomProps<T> = BaseProps<T> & TitleOrId

function NotLoaded({ title, children }: PropsWithChildren<{ title: ReactNode }>) {
  return (
    <Stack>
      <Box>{title}</Box>
      {children}
    </Stack>
  )
}

export function RenderLoadableAtom<T>({ atom, render, progress = 'circular', ...props }: RenderLoadableAtomProps<T>) {
  const id: string = ('id' in props ? props.id : props.title)!
  const title = props.title
  const [value] = useAtom(atom)
  if (value.state === 'loading')
    return (
      <NotLoaded title={title}>
        {progress === 'circular' ? <CircularProgressLoader id={`${id}-loading`} /> : <LinearProgressLoader />}
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

export function RenderAtom<T>({ atom, render }: RenderAtomProps<T>) {
  const [value] = useAtom(atom)
  if (!value) return null

  return render(value)
}
