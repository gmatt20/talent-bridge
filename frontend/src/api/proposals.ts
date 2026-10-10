import type { AcceptProposalResponse, Proposal } from '@/types/api'
import { request } from './client'

export const create = (projectId: number, coverLetter: string) =>
  request<Proposal>('POST', `/api/projects/${projectId}/proposals`, { coverLetter })

export const listForProject = (projectId: number) =>
  request<Proposal[]>('GET', `/api/projects/${projectId}/proposals`)

export const accept = (id: number) =>
  request<AcceptProposalResponse>('POST', `/api/proposals/${id}/accept`)
