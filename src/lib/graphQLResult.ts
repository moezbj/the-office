// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function graphQLResult<T>(data: Record<any, T>): T {
  return Object.values(data)[0]
}
