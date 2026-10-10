import type {Skill} from '../types/api';
import {request} from './client';

/** Searches the skill catalog by name, for tagging profiles and projects. */
export function search(query: string) {
  return request<Skill[]>('GET', `/api/skills?q=${encodeURIComponent(query)}`);
}
