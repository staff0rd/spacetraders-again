import { contractsAtom } from '../../data'
import { DataTable } from './DataTable'
import { RenderLoadableAtom } from './RenderLoadableAtom'

export const Contracts = () => {
  return (
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
  )
}
