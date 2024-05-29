import { statusAtom } from '../../data'
import { DataTable } from '../../shared/DataTable'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

export function MostSubmittedCharts() {
  return (
    <RenderLoadableAtom
      id="most-submitted-charts"
      atom={statusAtom}
      render={(status) => (
        <DataTable
          title="Most submitted charts"
          headers={['Rank', 'Agent', 'Charts Submitted']}
          rows={status.leaderboards.mostSubmittedCharts.map((row, ix) => [ix + 1, row.agentSymbol, row.chartCount.toLocaleString()])}
        />
      )}
    />
  )
}
