export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  assigneeId?: number;
  assigneeName?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  priority: string;
  status?: string;
  dueDate?: string;
  assigneeId?: number;
  tagIds: number[];
}
