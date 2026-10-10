import type {
  CreateProjectRequest,
  Paginated,
  Project,
  ProjectBrief,
  ProjectRecommendations,
  ProjectSummary,
  Team,
} from '../types/api';
import {request} from './client';

/** Lists open projects. */
export function list() {
  return request<Paginated<ProjectSummary>>('GET', '/api/projects');
}

/** Loads a project, including its AI brief once analyzed. */
export function get(id: number) {
  return request<Project>('GET', `/api/projects/${id}`);
}

/** Submits a new challenge for the signed-in organization. */
export function create(body: CreateProjectRequest) {
  return request<Project>('POST', '/api/projects', body);
}

/** Asks the AI to turn a project's description into a structured brief. */
export function analyze(id: number) {
  return request<ProjectBrief>('POST', `/api/projects/${id}/analyze`);
}

/** Loads the students and mentors the AI recommends for a project. */
export function recommendations(id: number) {
  return request<ProjectRecommendations>(
    'GET',
    `/api/projects/${id}/recommendations`,
  );
}

/** Loads the team formed around a project. */
export function team(id: number) {
  return request<Team>('GET', `/api/projects/${id}/team`);
}
