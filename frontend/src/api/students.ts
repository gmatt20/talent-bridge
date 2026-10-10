import type {
  Paginated,
  Proposal,
  StudentProfile,
  StudentRecommendation,
  UpdateStudentProfileRequest,
} from '@/types/api'
import { request } from './client'

export const get = (id: number) => request<StudentProfile>('GET', `/api/students/${id}`)

export const updateMe = (body: UpdateStudentProfileRequest) =>
  request<StudentProfile>('PUT', '/api/students/me', body)

export const recommendations = () =>
  request<Paginated<StudentRecommendation>>('GET', '/api/students/me/recommendations')

// Proposed endpoint, not yet in the ARCHITECTURE.md contract.
export const myProposals = () =>
  request<Paginated<Proposal & { project: { id: number; title: string } }>>(
    'GET',
    '/api/students/me/proposals',
  )
