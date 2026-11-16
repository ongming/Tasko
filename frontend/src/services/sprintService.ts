import { api } from '@/lib/api'
import type {
  Sprint,
  CreateSprintPayload,
  StartSprintPayload,
  CompleteSprintPayload,
} from '@/types/sprint'

export const sprintService = {
  async getSprints(projectIdOrKey: string): Promise<Sprint[]> {
    return api.get<Sprint[]>(`/projects/${projectIdOrKey}/sprints`)
  },

  async createSprint(projectIdOrKey: string, payload?: CreateSprintPayload): Promise<Sprint> {
    return api.post<Sprint>(`/projects/${projectIdOrKey}/sprints`, payload || {})
  },

  async updateSprint(
    projectIdOrKey: string,
    sprintId: string,
    payload: Partial<CreateSprintPayload>,
  ): Promise<Sprint> {
    return api.patch<Sprint>(
      `/projects/${projectIdOrKey}/sprints/${sprintId}`,
      payload,
    )
  },

  async startSprint(
    projectIdOrKey: string,
    sprintId: string,
    payload: StartSprintPayload,
  ): Promise<Sprint> {
    return api.post<Sprint>(
      `/projects/${projectIdOrKey}/sprints/${sprintId}/start`,
      payload,
    )
  },

  async completeSprint(
    projectIdOrKey: string,
    sprintId: string,
    payload?: CompleteSprintPayload,
  ): Promise<{
    sprint: Sprint
    completedTaskCount: number
    uncompletedTaskCount: number
    movedToSprintId: string | null
  }> {
    return api.post(
      `/projects/${projectIdOrKey}/sprints/${sprintId}/complete`,
      payload || {},
    )
  },

  async deleteSprint(projectIdOrKey: string, sprintId: string): Promise<void> {
    await api.delete(`/projects/${projectIdOrKey}/sprints/${sprintId}`)
  },
}
