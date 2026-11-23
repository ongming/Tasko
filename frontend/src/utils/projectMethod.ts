import type { Project } from '@/types/workspace'

/**
 * Xác định dự án có sử dụng phương pháp Scrum hoặc Scrumban (có Backlog & Sprint) hay không.
 * Chỉ dựa vào `methodology` hoặc `settings.method_id`, không đoán theo tên dự án.
 */
export function isScrumProject(project?: Project | null): boolean {
  if (!project) return false
  const method = project.settings?.method_id?.toLowerCase()
  const methodology = project.methodology?.toUpperCase()
  return (
    methodology === 'SCRUM' ||
    methodology === 'SCRUMBAN' ||
    method === 'scrum' ||
    method === 'scrumban'
  )
}
