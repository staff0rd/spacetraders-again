import { statusAtom } from '../../data'
import { DataTable } from '../../shared/DataTable'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

export function MostCredits() {
  return (
    <RenderLoadableAtom
      id="most-credits"
      atom={statusAtom}
      render={(status) => (
        <DataTable
          title="Most credits"
          headers={['Rank', 'Agent', 'Net Worth']}
          rows={status.leaderboards.mostCredits.map((row, ix) => [ix + 1, row.agentSymbol, row.credits.toLocaleString()])}
        />
      )}
    />
  )
}
