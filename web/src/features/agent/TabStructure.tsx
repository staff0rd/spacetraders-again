import { Stack, Tab, Tabs } from '@mui/material'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { ReactNode } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { slugify } from '../../utils/slugify'

type TabStructureProps<T> = {
  regex: string
  value: Loadable<Promise<T | undefined>>
  root: ReactNode
  header: (value: Awaited<T> | undefined) => ReactNode
  tabs: string[]
}
export function TabStructure<T>({ regex, value, root, header, tabs }: TabStructureProps<T>) {
  const { pathname } = useLocation()
  const matches = pathname.match(regex) ?? []
  const tab = matches[1] ?? ''

  if (value.state !== 'hasData') return null
  return (
    <Stack>
      {header(value.data)}
      <Tabs value={tab}>
        {tabs.map((t, ix) => (
          <Tab key={slugify(t)} label={t} value={ix ? slugify(t) : ''} to={ix ? slugify(t) : ''} component={Link} />
        ))}
        <Tab label="Raw" value="raw" to="raw" component={Link} />
      </Tabs>
      {!tab ? root : <Outlet />}
    </Stack>
  )
}
