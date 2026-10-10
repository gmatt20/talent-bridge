import type {
  CreateProjectRequest,
  Paginated,
  Project,
  ProjectBrief,
  ProjectRecommendations,
  ProjectSummary,
  Team,
} from '@/types/api'
import { request } from './client'

export const list = () => request<Paginated<ProjectSummary>>('GET', '/api/projects')

export const get = (id: number) => request<Project>('GET', `/api/projects/${id}`)

export const create = (body: CreateProjectRequest) =>
  request<Project>('POST', '/api/projects', body)

export const analyze = (id: number) =>
  request<ProjectBrief>('POST', `/api/projects/${id}/analyze`)

export const recommendations = (id: number) =>
  request<ProjectRecommendations>('GET', `/api/projects/${id}/recommendations`)

export const team = (id: number) => request<Team>('GET', `/api/projects/${id}/team`)
