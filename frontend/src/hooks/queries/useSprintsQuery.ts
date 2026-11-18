import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sprintService } from '@/services/sprintService'
import type {
  Sprint,
  CreateSprintPayload,
  StartSprintPayload,
  CompleteSprintPayload,
} from '@/types/sprint'

export const sprintKeys = {
  all: ['project-sprints'] as const,
  byProject: (projectIdOrKey?: string) => ['project-sprints', projectIdOrKey] as const,
}

/**
 * Hook truy vấn danh sách Sprint của Dự án
 */
export function useProjectSprints(projectIdOrKey?: string) {
  return useQuery<Sprint[]>({
    queryKey: sprintKeys.byProject(projectIdOrKey),
    queryFn: () => (projectIdOrKey ? sprintService.getSprints(projectIdOrKey) : Promise.resolve([])),
    enabled: Boolean(projectIdOrKey),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook tạo Sprint mới
 */
export function useCreateSprintMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: CreateSprintPayload) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return sprintService.createSprint(projectIdOrKey, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectIdOrKey) })
    },
  })
}

/**
 * Hook cập nhật Sprint
 */
export function useUpdateSprintMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprintId, payload }: { sprintId: string; payload: Partial<CreateSprintPayload> }) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return sprintService.updateSprint(projectIdOrKey, sprintId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectIdOrKey) })
    },
  })
}

/**
 * Hook bắt đầu Sprint
 */
export function useStartSprintMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprintId, payload }: { sprintId: string; payload: StartSprintPayload }) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return sprintService.startSprint(projectIdOrKey, sprintId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectIdOrKey) })
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
    },
  })
}

/**
 * Hook hoàn thành Sprint
 */
export function useCompleteSprintMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sprintId, payload }: { sprintId: string; payload?: CompleteSprintPayload }) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return sprintService.completeSprint(projectIdOrKey, sprintId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectIdOrKey) })
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
    },
  })
}

/**
 * Hook xóa Sprint
 */
export function useDeleteSprintMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sprintId: string) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return sprintService.deleteSprint(projectIdOrKey, sprintId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectIdOrKey) })
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
    },
  })
}
