import type {Organization, Paginated, ProjectSummary} from '../types/api';
import {request} from './client';

/** Loads an organization's public profile. */
export function get(id: number) {
  return request<Organization>('GET', `/api/organizations/${id}`);
}

/**
 * Updates the signed-in organization's profile. Proposed endpoint, not yet in
 * the ARCHITECTURE.md contract.
 */
export function updateMe(
  body: Pick<Organization, 'companyName' | 'description' | 'website'>,
) {
  return request<Organization>('PUT', '/api/organizations/me', body);
}

/**
 * Lists the signed-in organization's projects. Proposed endpoint, not yet in
 * the ARCHITECTURE.md contract.
 */
export function myProjects() {
  return request<Paginated<ProjectSummary>>(
    'GET',
    '/api/organizations/me/projects',
  );
}
