import { Box, CircularProgress, Stack } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Outlet, useParams } from 'react-router-dom'
import { agentAtom, contractsAtom, getSystemSymbolFromWaypointSymbol } from '../../data'
import { routes } from '../../router'
import { DataTable } from './DataTable'
import { Overview } from './Overview'
import { RenderLoadableAtom } from './RenderLoadableAtom'
import { RouterLink } from './RouterLink'
import { TabStructure } from './TabStructure'

export const Agent = () => {
  const agent = useAtomValue(agentAtom)
  const { systemSymbol } = useParams()

  const regex = `^/(.*)/?.*`
  return (
    <Stack spacing={1}>
      <Box sx={{ padding: 1 }}>
        {systemSymbol ? (
          <Outlet />
        ) : (
          <TabStructure
            id="agent-tabs"
            regex={regex}
            value={agent}
            tabs={['Contracts']}
            firstTab={
              <RenderLoadableAtom
                id="contracts"
                atom={contractsAtom}
                render={(contracts) => (
                  <DataTable
                    headers={['Faction', 'Fulfilled', 'Type', 'On accepted', 'On fulfilled', 'Destination', 'Trade', 'Units']}
                    rows={contracts
                      .toSorted((a, b) =>
                        (b.deadlineToAccept ?? new Date().toISOString()).localeCompare(a.deadlineToAccept ?? new Date().toISOString()),
                      )
                      .map((contract) => [
                        contract.factionSymbol,
                        contract.fulfilled ? '✅' : '➖ ',
                        contract.type,
                        contract.terms.payment.onAccepted.toLocaleString(),
                        contract.terms.payment.onFulfilled.toLocaleString(),
                        contract.terms.deliver![0].destinationSymbol,
                        contract.terms.deliver![0].tradeSymbol.replace('_', ' '),
                        `${contract.terms.deliver![0].unitsFulfilled}/${contract.terms.deliver![0].unitsRequired}`,
                      ])}
                    title="Contracts"
                  />
                )}
              />
            }
            header={(agent) => {
              if (!agent) return <CircularProgress id="agent-tabs-header" />
              const homeSystem = getSystemSymbolFromWaypointSymbol(agent.headquarters)
              return (
                <Overview
                  lines={[
                    `Credits: $${agent.credits.toLocaleString()}`,
                    <RouterLink to={homeSystem ? routes.system(homeSystem) : ''}>Home system: {homeSystem}</RouterLink>,
                  ]}
                  subtype="Your agent"
                  symbol={agent.symbol}
                  type="Agent"
                />
              )
            }}
          />
        )}
      </Box>
    </Stack>
  )
}
