export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  backgroundColor?: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  backgroundColor?: string;
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
