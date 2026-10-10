import type { Organization, Paginated, ProjectSummary } from '@/types/api'
import { request } from './client'

export const get = (id: number) => request<Organization>('GET', `/api/organizations/${id}`)

// Proposed endpoints, not yet in the README contract.
export const updateMe = (body: Pick<Organization, 'companyName' | 'description' | 'website'>) =>
  request<Organization>('PUT', '/api/organizations/me', body)

export const myProjects = () =>
  request<Paginated<ProjectSummary>>('GET', '/api/organizations/me/projects')
