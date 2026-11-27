import {
  AdminUser,
  ModerationReport,
  AdminApproval,
  ModuleConfig,
  AdminAuditLog,
  DashboardStats,
  SystemModuleKey
} from '../types/admin';

const BASE_URL = '/api/admin';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      errMsg = errData.error || errData.message || errMsg;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export const adminApi = {
  // 1. Dashboard
  async getDashboard(): Promise<{ success: boolean; data: DashboardStats }> {
    return request('/dashboard');
  },

  // 2. Users Management
  async getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    module?: string;
  }): Promise<{ success: boolean; users: AdminUser[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.module) params.append('module', filters.module);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/users${query}`);
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    role: string;
    department?: string;
    title?: string;
    moduleAccess?: SystemModuleKey[];
    licenseNumber?: string;
    licenseState?: string;
    licenseStatus?: string;
    status?: string;
    phone?: string;
    isSuperAdmin?: boolean;
  }): Promise<{ success: boolean; user: AdminUser }> {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: string, payload: Partial<AdminUser> & { moduleAccess?: SystemModuleKey[] }): Promise<{ success: boolean; user: AdminUser }> {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async approveUser(id: string, adminNotes?: string): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return request(`/users/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes }),
    });
  },

  async blockUser(id: string, reason: string): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return request(`/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async unblockUser(id: string): Promise<{ success: boolean; message: string; user: AdminUser }> {
    return request(`/users/${id}/unblock`, {
      method: 'POST',
    });
  },

  async updateUserStatus(id: string, status: string, reason?: string): Promise<{ success: boolean; user: AdminUser }> {
    return request(`/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, reason }),
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // 3. Moderation & Safety
  async getModerationReports(filters?: {
    status?: string;
    type?: string;
    severity?: string;
  }): Promise<{ success: boolean; reports: ModerationReport[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/moderation/reports${query}`);
  },

  async fileReport(payload: {
    reportType: string;
    reporterId?: string;
    reporterName: string;
    reportedUserId?: string;
    reportedUserName: string;
    reportedMessageId?: string;
    messageContent?: string;
    reason: string;
    severity?: string;
  }): Promise<{ success: boolean; report: ModerationReport }> {
    return request('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async resolveReport(id: string, payload: {
    actionTaken: string;
    adminNotes: string;
    status?: string;
  }): Promise<{ success: boolean; report: ModerationReport }> {
    return request(`/moderation/reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getBlockedUsers(): Promise<{ success: boolean; blockedUsers: AdminUser[]; total: number }> {
    return request('/moderation/blocked');
  },

  async getMessagesForAudit(search?: string, limit = 50): Promise<{ success: boolean; messages: any[]; total: number }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', String(limit));
    return request(`/moderation/messages?${params.toString()}`);
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean; message: string }> {
    return request(`/moderation/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  // 4. Approvals Queue
  async getApprovals(filters?: {
    module?: string;
    status?: string;
    type?: string;
  }): Promise<{ success: boolean; approvals: AdminApproval[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.module) params.append('module', filters.module);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/approvals${query}`);
  },

  async submitApprovalDecision(id: string, decision: 'approved' | 'rejected', reviewNotes?: string): Promise<{ success: boolean; approval: AdminApproval }> {
    return request(`/approvals/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reviewNotes }),
    });
  },

  // 5. Separate Modules Management (Central, Home Health, Connect)
  async getModules(): Promise<{ success: boolean; modules: ModuleConfig[] }> {
    return request('/modules');
  },

  async updateModuleConfig(moduleKey: SystemModuleKey, payload: {
    status?: 'operational' | 'maintenance' | 'restricted';
    settings?: Record<string, any>;
  }): Promise<{ success: boolean; module: ModuleConfig }> {
    return request(`/modules/${moduleKey}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // 6. Audit Logs
  async getAuditLogs(filters?: {
    search?: string;
    module?: string;
    action?: string;
    limit?: number;
  }): Promise<{ success: boolean; logs: AdminAuditLog[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/audit-logs${query}`);
  },
};
