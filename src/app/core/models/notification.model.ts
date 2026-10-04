export enum NotificationType {
  PROJECT_INVITE = 'PROJECT_INVITE',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  GENERAL = 'GENERAL'
}

export interface Notification {
  id: number;
  projectId?: number;
  projectName?: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
