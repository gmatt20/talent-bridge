import type { Skill } from '@/types/api'
import { request } from './client'

export const search = (q: string) =>
  request<Skill[]>('GET', `/api/skills?q=${encodeURIComponent(q)}`)
