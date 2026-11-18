import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import type {
  Task,
  TaskItem,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
  TaskFilterParams,
} from '@/types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId?: string) => ['tasks', { projectId }] as const,
  projectTasks: (projectIdOrKey?: string, params?: TaskFilterParams) =>
    ['project-tasks', projectIdOrKey, params] as const,
  projectTask: (projectIdOrKey?: string, taskId?: string) =>
    ['project-task', projectIdOrKey, taskId] as const,
}

/**
 * Hook truy vấn danh sách công việc theo dự án (API chuẩn RESTful)
 */
export function useProjectTasks(projectIdOrKey?: string, params?: TaskFilterParams) {
  return useQuery<TaskItem[]>({
    queryKey: taskKeys.projectTasks(projectIdOrKey, params),
    queryFn: () =>
      projectIdOrKey
        ? taskService.getProjectTasks(projectIdOrKey, params)
        : Promise.resolve([]),
    enabled: Boolean(projectIdOrKey),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook truy vấn chi tiết một Task
 */
export function useProjectTask(projectIdOrKey?: string, taskId?: string | null) {
  return useQuery<TaskItem>({
    queryKey: taskKeys.projectTask(projectIdOrKey, taskId || undefined),
    queryFn: () => {
      if (!projectIdOrKey || !taskId) throw new Error('Tham số không hợp lệ')
      return taskService.getTaskById(projectIdOrKey, taskId)
    },
    enabled: Boolean(projectIdOrKey && taskId),
    staleTime: 1000 * 60 * 1,
  })
}

/**
 * Hook tạo công việc mới trong Project
 */
export function useCreateProjectTaskMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return taskService.createProjectTask(projectIdOrKey, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectIdOrKey] })
    },
  })
}

/**
 * Hook cập nhật công việc trong Project
 */
export function useUpdateProjectTaskMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return taskService.updateProjectTask(projectIdOrKey, taskId, payload)
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
      queryClient.invalidateQueries({ queryKey: ['project-task', projectIdOrKey, taskId] })
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectIdOrKey] })
    },
  })
}

/**
 * Hook di chuyển công việc (moveTask)
 */
export function useMoveProjectTaskMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: MoveTaskPayload }) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return taskService.moveProjectTask(projectIdOrKey, taskId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectIdOrKey] })
    },
  })
}

/**
 * Hook xóa công việc trong Project
 */
export function useDeleteProjectTaskMutation(projectIdOrKey?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => {
      if (!projectIdOrKey) throw new Error('Mã dự án không hợp lệ')
      return taskService.deleteProjectTask(projectIdOrKey, taskId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectIdOrKey] })
      queryClient.invalidateQueries({ queryKey: ['project-sprints', projectIdOrKey] })
    },
  })
}

// ========================================================
// LEGACY HOOKS (Duy trì tính tương thích ngược cho Overview)
// ========================================================
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => taskService.getTasks(projectId),
    staleTime: 1000 * 60 * 3,
  })
}

export function useCreateTaskMutation(projectId?: string) {
  const queryClient = useQueryClient()
  const currentKey = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onMutate: async (newTaskPayload) => {
      await queryClient.cancelQueries({ queryKey: currentKey })
      const previousTasks = queryClient.getQueryData<Task[]>(currentKey) || []

      const optimisticTask: Task = {
        id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        title: newTaskPayload.title,
        status: newTaskPayload.status || 'Backlog',
        statusColor: 'bg-slate-100 text-slate-700',
        tag: newTaskPayload.tag || 'Chung',
        tagClass: 'bg-slate-100 text-slate-700',
        dueDate: newTaskPayload.dueDate || 'Hôm nay',
        points: 1,
        assignees: [],
        isDone: false,
      }

      queryClient.setQueryData<Task[]>(currentKey, (old = []) => [
        optimisticTask,
        ...old,
      ])

      return { previousTasks }
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(currentKey, context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: currentKey })
    },
  })
}
