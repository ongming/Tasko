import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService, CreateProjectPayload } from '@/services/projectService'
import type { Project } from '@/types/workspace'

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
}

/**
 * Hook truy vấn danh sách dự án với cache tự động 5 phút
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectService.getProjects,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook tạo dự án mới với Optimistic Update
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    // Optimistic Update: Thêm ngay vào cache trước khi server phản hồi
    onMutate: async (newProjectPayload) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.all })
      const previousProjects = queryClient.getQueryData<Project[]>(projectKeys.all) || []

      const optimisticProject: Project = {
        id: `optimistic-${Date.now()}`,
        name: newProjectPayload.name,
        key: newProjectPayload.key,
        color: newProjectPayload.color || 'bg-indigo-600',
        tasks: 0,
      }

      queryClient.setQueryData<Project[]>(projectKeys.all, (old = []) => [
        ...old,
        optimisticProject,
      ])

      return { previousProjects }
    },
    onError: (_err, _newProject, context) => {
      // Rollback nếu thất bại
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.all, context.previousProjects)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
