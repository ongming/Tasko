import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService, CreateTaskPayload } from '@/services/taskService'
import type { Task } from '@/types/task'

export const taskKeys = {
  all: ['tasks'] as const,
  byProject: (projectId?: string) => ['tasks', { projectId }] as const,
}

/**
 * Hook truy vấn danh sách công việc theo dự án
 */
export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId),
    queryFn: () => taskService.getTasks(projectId),
    staleTime: 1000 * 60 * 3, // Cache 3 phút
  })
}

/**
 * Hook tạo công việc mới với Optimistic Update tức thì
 */
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

      // Đẩy task mới lên đầu cache ngay lập tức (0ms delay)
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

/**
 * Hook cập nhật trạng thái khi kéo thả thẻ Kanban (Optimistic Status Update)
 */
export function useUpdateTaskStatusMutation(projectId?: string) {
  const queryClient = useQueryClient()
  const currentKey = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      taskService.updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: currentKey })
      const previousTasks = queryClient.getQueryData<Task[]>(currentKey) || []

      // Cập nhật trạng thái trực tiếp trong cache để thẻ nhảy cột ngay tức khắc
      queryClient.setQueryData<Task[]>(currentKey, (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, status } : t))
      )

      return { previousTasks }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(currentKey, context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: currentKey })
    },
  })
}

/**
 * Hook tick chọn hoàn thành task (Optimistic Checkbox Toggle)
 */
export function useToggleTaskMutation(projectId?: string) {
  const queryClient = useQueryClient()
  const currentKey = taskKeys.byProject(projectId)

  return useMutation({
    mutationFn: ({ taskId, isDone }: { taskId: string; isDone: boolean }) =>
      taskService.toggleTask(taskId, isDone),
    onMutate: async ({ taskId, isDone }) => {
      await queryClient.cancelQueries({ queryKey: currentKey })
      const previousTasks = queryClient.getQueryData<Task[]>(currentKey) || []

      queryClient.setQueryData<Task[]>(currentKey, (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, isDone } : t))
      )

      return { previousTasks }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(currentKey, context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: currentKey })
    },
  })
}
