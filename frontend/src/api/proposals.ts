import type {AcceptProposalResponse, Proposal} from '../types/api';
import {request} from './client';

/** Submits the signed-in student's application to a project. */
export function create(projectId: number, coverLetter: string) {
  return request<Proposal>('POST', `/api/projects/${projectId}/proposals`, {
    coverLetter,
  });
}

/** Lists the applications to a project, for its organization. */
export function listForProject(projectId: number) {
  return request<Proposal[]>('GET', `/api/projects/${projectId}/proposals`);
}

/** Accepts an application, which starts forming the project's team. */
export function accept(id: number) {
  return request<AcceptProposalResponse>('POST', `/api/proposals/${id}/accept`);
}
