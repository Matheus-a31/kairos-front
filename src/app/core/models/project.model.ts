export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
}
