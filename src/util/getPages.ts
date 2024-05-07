import { Meta } from '../api'

export const getPages = async <T>(endpoint: (page: number, count: number) => Promise<{ data: { data: T[]; meta: Meta } }>) => {
  const pageSize = 20
  const {
    data: { data, meta },
  } = await endpoint(1, pageSize)
  if (meta.total > meta.page * meta.limit) {
    const all = await Promise.all(Array.from({ length: Math.ceil(meta.total / meta.limit) - 1 }, (_, i) => endpoint(i + 2, pageSize)))
    return data.concat(all.flatMap((r) => r.data.data))
  }
  return data
}
