export function heatColor(count: number): string {
  if (count === 0) return '#f5f7fb'
  if (count <= 2)  return '#e8f0ff'
  if (count <= 5)  return '#5b8cff'
  if (count <= 9)  return '#2a6af0'
  return '#ff6a55'
}
