import type {
  Paginated,
  Proposal,
  StudentProfile,
  StudentRecommendation,
  UpdateStudentProfileRequest,
} from '../types/api';
import {request} from './client';

/** A student's application, with the project it was made to. */
export interface ProposalWithProject extends Proposal {
  project: {id: number; title: string};
}

/** Loads a student's public profile. */
export function get(id: number) {
  return request<StudentProfile>('GET', `/api/students/${id}`);
}

/** Updates the signed-in student's profile. */
export function updateMe(body: UpdateStudentProfileRequest) {
  return request<StudentProfile>('PUT', '/api/students/me', body);
}

/** Loads the projects the AI recommends for the signed-in student. */
export function recommendations() {
  return request<Paginated<StudentRecommendation>>(
    'GET',
    '/api/students/me/recommendations',
  );
}

/**
 * Lists the signed-in student's applications. Proposed endpoint, not yet in
 * the ARCHITECTURE.md contract.
 */
export function myProposals() {
  return request<Paginated<ProposalWithProject>>(
    'GET',
    '/api/students/me/proposals',
  );
}
