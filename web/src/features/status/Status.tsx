import { Alert, Box, Link, Stack, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { statusAtom } from '../../data'
import { RenderLoadableAtom } from '../agent/RenderLoadableAtom'
import { RouterLink } from '../agent/RouterLink'
import { TabStructure } from '../agent/TabStructure'

export function Status() {
  const value = useAtomValue(statusAtom)
  const regex = `^/status/(.*)/?.*`
  return (
    <RenderLoadableAtom
      atom={statusAtom}
      id="status"
      render={({ status, version, resetDate, description }) => (
        <TabStructure
          regex={regex}
          tabs={['status', 'most-credits']}
          value={value}
          firstTab={
            <Stack spacing={1} sx={{ padding: 2 }}>
              <Alert severity="info">
                <Stack spacing={1}>
                  <Box>{status}</Box>
                  <Box>{version}</Box>
                  <Box>Reset date: {resetDate}</Box>
                </Stack>
              </Alert>
              <Box>
                <Typography variant="h6">About SpaceTraders API</Typography>
                <Typography variant="body1">{description}</Typography>
              </Box>

              <Box>
                <Typography variant="h6">About this tool</Typography>
                <Typography variant="body1">
                  This tool facilitates browsing of SpaceTraders data. For most functionality, consider{' '}
                  <RouterLink to="/login">logging in</RouterLink> with a valid SpaceTraders API token.
                </Typography>
              </Box>

              <Box>
                This tool is <Link href="https://github.com/staff0rd/spacetraders-again/web">open source.</Link>
              </Box>
            </Stack>
          }
          header={(status) => <></>}
          id="status"
        />
      )}
    />
  )
}
