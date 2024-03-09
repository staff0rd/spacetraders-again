import { DefaultApiFactory } from '../api'

// eslint-disable-next-line no-constant-condition
while (true) {
  const result = await DefaultApiFactory().getStatus()
  // eslint-disable-next-line no-console
  console.log(result.data)
  await new Promise((r) => setTimeout(r, 300_000))
}
