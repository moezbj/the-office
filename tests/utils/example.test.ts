import { formatDate } from '../../src/utils/dateUtils'

test('formats date strings', () => {
  const formatted = formatDate('2026-06-07T12:00:00Z')
  expect(formatted).toContain('2026')
})
