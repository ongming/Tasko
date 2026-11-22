/**
 * Định dạng đối tượng Date theo múi giờ địa phương thành chuỗi "YYYY-MM-DD".
 * Tránh dùng toISOString() vì bị dịch lùi sang múi giờ UTC (lệch 1 ngày ở UTC+7).
 */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
