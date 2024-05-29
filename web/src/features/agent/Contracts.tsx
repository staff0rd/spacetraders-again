import { contractsAtom } from '../../data'
import { DataTable } from '../../shared/DataTable'
import { RenderLoadableAtom } from '../../shared/RenderLoadableAtom'

export const Contracts = () => {
  return (
    <RenderLoadableAtom
      id="contracts"
      atom={contractsAtom}
      render={(contracts) => (
        <DataTable
          headers={['Fulfilled', 'On accepted', 'On fulfilled', 'Destination', 'Trade', 'Units']}
          rows={contracts
            .toSorted((a, b) =>
              (b.deadlineToAccept ?? new Date().toISOString()).localeCompare(a.deadlineToAccept ?? new Date().toISOString()),
            )
            .map((contract) => [
              contract.fulfilled ? '✅' : '➖ ',

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
