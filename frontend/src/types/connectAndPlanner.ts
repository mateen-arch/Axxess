import { ServiceLine, PriorityLevel } from './index';

export type ConnectTab = 'chat' | 'calls';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  isCurrentUser: boolean;
  content: string;
  timestamp: string;
  date: string;
  isRead: boolean;
  attachment?: {
    name: string;
    type: 'pdf' | 'doc' | 'image';
    size: string;
    url?: string;
  };
  urgent?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'care_team' | 'channel';
  title: string;
  subtitle: string;
  patientId?: string;
  patientName?: string;
  serviceLine: ServiceLine;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    status: 'online' | 'busy' | 'offline';
  }[];
  lastMessage: {
    senderName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  isPinned?: boolean;
  isUrgent?: boolean;
}

export interface CallLogItem {
  id: string;
  contactId: string;
  contactName: string;
  contactRole: string;
  direction: 'inbound' | 'outbound' | 'missed';
  callType: 'audio' | 'video';
  duration: string;
  timestamp: string;
  date: string;
  status: 'completed' | 'missed' | 'declined';
  patientContext?: string;
}

export type PlannerViewMode = 'kanban' | 'timeline' | 'recertification';

export type PlannerTaskStage = 
  | 'to_plan' 
  | 'assigned' 
  | 'in_progress' 
  | 'pending_signoff' 
  | 'completed';

export interface PlannerTaskItem {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  serviceLine: ServiceLine;
  discipline: string;
  title: string;
  taskType: 'visit' | 'oasis' | 'recertification' | 'supervisory' | 'physician_order';
  assignedClinicianName?: string;
  assignedClinicianId?: string;
  dueDate: string;
  dueTime?: string;
  episodeStartDate?: string;
  episodeEndDate?: string;
  recertificationDaysRemaining?: number;
  stage: PlannerTaskStage;
  priority: PriorityLevel;
  notes?: string;
  billable: boolean;
  qCode?: string;
}

