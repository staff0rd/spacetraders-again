import { Box, Stack, Tab, Tabs } from '@mui/material'
import { Loadable } from 'jotai/vanilla/utils/loadable'
import { ReactNode } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { slugify } from '../utils/slugify'
import { CircularProgressLoader } from './CircularProgressLoader'

type TabStructureProps<T> = {
  regex: string
  value: Loadable<Promise<T | undefined>>
  firstTab: ReactNode
  header: (value: Awaited<T> | undefined) => ReactNode
  tabs: string[]
  id: string
  childTabs?: string[]
}
export function TabStructure<T>({ regex, value, firstTab: root, header, tabs, id, childTabs = [] }: TabStructureProps<T>) {
  const { pathname } = useLocation()
  const matches = pathname.match(regex) ?? []
  const tab = matches[1] ?? ''

  if (value.state === 'hasError') return <></>
  if (value.state !== 'hasData') return <CircularProgressLoader id={id} />
  return (
    <Stack>
      {header(value.data)}
      <Tabs value={tab}>
        {tabs.map((t, ix) => (
          <Tab key={slugify(t)} label={t} value={ix ? slugify(t) : ''} to={ix ? slugify(t) : ''} component={Link} />
        ))}
        <Tab label="Raw" value="raw" to="raw" component={Link} />
      </Tabs>
      <Box sx={{ marginTop: childTabs.includes(tab) ? 0 : 2 }}>{!tab ? root : <Outlet />}</Box>
    </Stack>
  )
}
