const rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://axxess-production-fb61b11f.up.railway.app' : '')
).trim();
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export interface DashboardMetricsResponse {
  activePatients: {
    total: number;
    homeHealth: number;
    homeCare: number;
    hospice: number;
  };
  unreadMessagesCount: number;
  unassignedVisits7Days: {
    total: number;
    homeHealth: number;
    homeCare: number;
  };
  intakeLast30Days: Array<{
    service: string;
    inquiry: number;
    referral: number;
    admitted: number;
    conversionRate: string;
  }>;
  scheduledVisitsLast30Days: {
    total: number;
    completed: number;
    missed: number;
    unassigned: number;
    inProgress: number;
    scheduled: number;
    homeHealthTotal: number;
    homeHealthCompleted: number;
    homeHealthMissed: number;
    homeHealthUnassigned: number;
    homeCareTotal: number;
    homeCareCompleted: number;
    homeCareMissed: number;
    homeCareUnassigned: number;
  };
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  // Face-to-Face Encounters

  async getFaceToFaceEncounters(patientId?: string) {
    let url = `${API_BASE_URL}/api/face-to-face-encounters`;
    if (patientId) url += `?patientId=${encodeURIComponent(patientId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch face-to-face encounters');
    return res.json();
  },

  async createFaceToFaceEncounter(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/face-to-face-encounters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create face-to-face encounter');
    }
    return res.json();
  },

  // Facilities

  async getFacilities() {
    const res = await fetch(`${API_BASE_URL}/api/facilities`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  },

  async createFacility(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/facilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create facility');
    }
    return res.json();
  },

  // Physicians

  async getPhysicians() {
    const res = await fetch(`${API_BASE_URL}/api/physicians`);
    if (!res.ok) throw new Error('Failed to fetch physicians');
    return res.json();
  },

  async createPhysician(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/physicians`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create physician');
    }
    return res.json();
  },

  // Insurance Payers

  async getInsurancePayers() {
    const res = await fetch(`${API_BASE_URL}/api/insurance-payers`);
    if (!res.ok) throw new Error('Failed to fetch insurance payers');
    return res.json();
  },

  async createInsurancePayer(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/insurance-payers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create insurance payer');
    }
    return res.json();
  },

  // Pharmacies

  async getPharmacies() {
    const res = await fetch(`${API_BASE_URL}/api/pharmacies`);
    if (!res.ok) throw new Error('Failed to fetch pharmacies');
    return res.json();
  },

  async createPharmacy(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/pharmacies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create pharmacy');
    }
    return res.json();
  },

  // Infection Logs

  async getInfectionLogs() {
    const res = await fetch(`${API_BASE_URL}/api/infection-logs`);
    if (!res.ok) throw new Error('Failed to fetch infection logs');
    return res.json();
  },

  async createInfectionLog(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/infection-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create infection log');
    }
    return res.json();
  },

  // Incident Logs

  async getIncidentLogs() {
    const res = await fetch(`${API_BASE_URL}/api/incident-logs`);
    if (!res.ok) throw new Error('Failed to fetch incident logs');
    return res.json();
  },

  async createIncidentLog(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/incident-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create incident log');
    }
    return res.json();
  },

  async getOrganization() {
    const res = await fetch(`${API_BASE_URL}/api/organization`);
    if (!res.ok) throw new Error('Failed to fetch organization');
    return res.json();
  },

  // Face-to-Face Encounters

  async getUserProfile() {
    const res = await fetch(`${API_BASE_URL}/api/user/profile`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Face-to-Face Encounters

  async updateUserProfile(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    return res.json();
  },

  // Face-to-Face Encounters

  async resetUserSignature() {
    const res = await fetch(`${API_BASE_URL}/api/user/reset-signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to reset signature');
    return res.json();
  },

  // Face-to-Face Encounters

  async getDashboardMetrics(): Promise<DashboardMetricsResponse> {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  // Face-to-Face Encounters

  async getMessages(folder?: string) {
    const url = folder ? `${API_BASE_URL}/api/messages?folder=${folder}` : `${API_BASE_URL}/api/messages`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  // Face-to-Face Encounters

  async createMessage(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Face-to-Face Encounters

  async deleteMessage(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/messages/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete message');
    return res.json();
  },

  // Face-to-Face Encounters

  async batchDeleteMessages(ids: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/messages/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to batch delete messages');
    return res.json();
  },

  // Face-to-Face Encounters

  async markMessageRead(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/messages/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to mark message read');
    return res.json();
  },

  // Face-to-Face Encounters

  async getEpisodes(patientId?: string) {
    const url = patientId ? `${API_BASE_URL}/api/episodes?patientId=${patientId}` : `${API_BASE_URL}/api/episodes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch episodes');
    return res.json();
  },

  // Face-to-Face Encounters

  async createEpisode(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/episodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create episode');
    }
    return res.json();
  },

  // Face-to-Face Encounters

  async getCommunicationNotes(patientId?: string) {
    const url = patientId ? `${API_BASE_URL}/api/communication-notes?patientId=${patientId}` : `${API_BASE_URL}/api/communication-notes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch communication notes');
    return res.json();
  },

  // Face-to-Face Encounters

  async createCommunicationNote(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/communication-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create communication note');
    }
    return res.json();
  },

  // Face-to-Face Encounters

  async getOrders(patientId?: string, status?: string) {
    let url = `${API_BASE_URL}/api/orders`;
    const params: string[] = [];
    if (patientId) params.push(`patientId=${encodeURIComponent(patientId)}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Face-to-Face Encounters

  async createOrder(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create order');
    }
    return res.json();
  },

  // Face-to-Face Encounters

  async getPatients() {
    const res = await fetch(`${API_BASE_URL}/api/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  // Face-to-Face Encounters

  async getAnnouncements() {
    const res = await fetch(`${API_BASE_URL}/api/announcements`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  // Face-to-Face Encounters

  async getIntakeStats() {
    const res = await fetch(`${API_BASE_URL}/api/intake/stats`);
    if (!res.ok) throw new Error('Failed to fetch intake stats');
    return res.json();
  },

  // Face-to-Face Encounters

  async getInquiries() {
    const res = await fetch(`${API_BASE_URL}/api/intake/inquiries`);
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
  },

  // Face-to-Face Encounters

  async getReferrals() {
    const res = await fetch(`${API_BASE_URL}/api/intake/referrals`);
    if (!res.ok) throw new Error('Failed to fetch referrals');
    return res.json();
  },

  // Face-to-Face Encounters

  async createInquiry(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/intake/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create inquiry');
    return res.json();
  },

  // Face-to-Face Encounters

  async updateInquiry(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/intake/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update inquiry');
    return res.json();
  },

  // Face-to-Face Encounters

  async convertInquiryToReferral(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/intake/inquiries/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to convert inquiry');
    return res.json();
  },

  // Face-to-Face Encounters

  async deleteInquiry(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/intake/inquiries/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete inquiry');
    return res.json();
  },

  // Face-to-Face Encounters

  async createReferral(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/intake/referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create referral');
    return res.json();
  },

  // Face-to-Face Encounters

  async updateReferral(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/intake/referrals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update referral');
    return res.json();
  },

  // Face-to-Face Encounters

  async deleteReferral(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/intake/referrals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete referral');
    return res.json();
  },

  // Face-to-Face Encounters

  async getScheduleStats() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/stats`);
    if (!res.ok) throw new Error('Failed to fetch schedule stats');
    return res.json();
  },

  // Face-to-Face Encounters

  async getClinicians() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/clinicians`);
    if (!res.ok) throw new Error('Failed to fetch clinicians');
    return res.json();
  },

  // Face-to-Face Encounters

  async getScheduleVisits() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/visits`);
    if (!res.ok) throw new Error('Failed to fetch schedule visits');
    return res.json();
  },

  // Face-to-Face Encounters

  async getMyScheduleTasks() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/my-schedule-tasks`);
    if (!res.ok) throw new Error('Failed to fetch my schedule tasks');
    return res.json();
  },

  // Face-to-Face Encounters

  async getNonVisitActivities() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/non-visit-activities`);
    if (!res.ok) throw new Error('Failed to fetch non-visit activities');
    return res.json();
  },

  // Face-to-Face Encounters

  async createNonVisitActivity(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/non-visit-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create non-visit activity');
    return json;
  },

  async deleteNonVisitActivity(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/non-visit-activities/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete non-visit activity');
    return res.json();
  },

  // Face-to-Face Encounters

  async getQATasks() {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks`);
    if (!res.ok) throw new Error('Failed to fetch QA tasks');
    return res.json();
  },

  // Face-to-Face Encounters

  async updateQATaskStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update QA task status');
    return json;
  },

  async updateQATaskTagsNotes(id: string, data: { notes?: string; tags?: string[] }) {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks/${id}/tags-notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update QA task tags and notes');
    return json;
  },

  async batchApproveQATasks(ids: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks/batch-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to batch approve tasks');
    return json;
  },

  async batchReturnQATasks(ids: string[], returnReason: string) {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks/batch-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, returnReason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to batch return tasks');
    return json;
  },

  async batchDeleteQATasks(ids: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/qa/tasks/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to batch delete tasks');
    return json;
  },

  async getUnassignedVisits() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/unassigned`);
    if (!res.ok) throw new Error('Failed to fetch unassigned visits');
    return res.json();
  },

  async getUnassignedPatientDetail(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/unassigned-patient-detail/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch unassigned patient detail');
    return res.json();
  },

  async batchScheduleVisits(data: {
    patientId: string;
    employeeId?: string;
    visitType: string;
    dates: string[];
    timeSlot?: string;
    postToAxxessCare?: boolean;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/quick-schedule-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to batch schedule visits');
    return json;
  },

  async completeVisitAssignment(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/complete-assignment/${patientId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to complete visit assignment');
    return json;
  },

  async getEpisodeFrequencies(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/episode-frequencies/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch episode frequencies');
    return res.json();
  },

  // Face-to-Face Encounters

  async getHuvSfvRecords() {
    const res = await fetch(`${API_BASE_URL}/api/schedule/huv-sfv`);
    if (!res.ok) throw new Error('Failed to fetch HUV/SFV records');
    return res.json();
  },

  // Face-to-Face Encounters

  async createScheduleVisit(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create visit');
    return json;
  },

  async updateScheduleVisit(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/visits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update visit');
    return json;
  },

  async deleteScheduleVisit(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/visits/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete visit');
    return res.json();
  },

  // Face-to-Face Encounters

  async assignUnassignedVisit(id: string, clinicianId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/unassigned/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clinicianId }),
    });
    if (!res.ok) throw new Error('Failed to assign visit');
    return res.json();
  },

  // Face-to-Face Encounters

  async bulkAssignUnassignedVisits(visitIds: string[], clinicianId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/unassigned/bulk-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitIds, clinicianId }),
    });
    if (!res.ok) throw new Error('Failed to bulk assign visits');
    return res.json();
  },

  // Face-to-Face Encounters

  async deleteUnassignedVisit(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/unassigned/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete unassigned visit');
    return res.json();
  },

  // Face-to-Face Encounters

  async createPatient(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to admit patient');
    return json;
  },

  async getPatientTasks(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch patient tasks');
    return res.json();
  },

  // Face-to-Face Encounters

  async createPatientTask(patientId: string, taskData: any) {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to create patient task');
    return res.json();
  },

  // Face-to-Face Encounters

  async deletePatientTask(patientId: string, taskId: string) {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  async updatePatientStatus(patientId: string, status: string, additionalData?: any) {
    const res = await fetch(`${API_BASE_URL}/api/patients/${patientId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...additionalData }),
    });
    if (!res.ok) throw new Error('Failed to update patient status');
    return res.json();
  },

  async getHospitalizations() {
    const res = await fetch(`${API_BASE_URL}/api/hospitalizations`);
    if (!res.ok) throw new Error('Failed to fetch hospitalizations');
    return res.json();
  },

  async createHospitalization(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/hospitalizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create hospitalization');
    return res.json();
  },

  async updateHospitalization(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/hospitalizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update hospitalization');
    return res.json();
  },

  async deleteHospitalization(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/hospitalizations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete hospitalization');
    return res.json();
  },

  async getInpatientHolds() {
    const res = await fetch(`${API_BASE_URL}/api/inpatient-holds`);
    if (!res.ok) throw new Error('Failed to fetch inpatient holds');
    return res.json();
  },

  async createInpatientHold(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/inpatient-holds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create inpatient hold');
    return res.json();
  },

  async deleteInpatientHold(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/inpatient-holds/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete inpatient hold');
    return res.json();
  },


  // Connect & Planner & Reports APIs
  async getConnectConversations() {
    const res = await fetch(`${API_BASE_URL}/api/connect/conversations`);
    if (!res.ok) throw new Error('Failed to fetch connect conversations');
    return res.json();
  },

  async getConnectMessages(conversationId: string) {
    const res = await fetch(`${API_BASE_URL}/api/connect/conversations/${conversationId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendConnectMessage(conversationId: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/api/connect/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async markConnectConversationRead(conversationId: string) {
    const res = await fetch(`${API_BASE_URL}/api/connect/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  async createConnectConversation(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/connect/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  },

  async getConnectCallLogs() {
    const res = await fetch(`${API_BASE_URL}/api/connect/call-logs`);
    if (!res.ok) throw new Error('Failed to fetch call logs');
    return res.json();
  },

  async logConnectCall(data: any) {
    const res = await fetch(`${API_BASE_URL}/api/connect/call-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log call');
    return res.json();
  },

  async getPlannerItinerary(clinicianId?: string, date?: string) {
    let url = `${API_BASE_URL}/api/planner/itinerary`;
    const params = new URLSearchParams();
    if (clinicianId) params.append('clinicianId', clinicianId);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch itinerary');
    return res.json();
  },

  async getPlannerUnreadMessages() {
    const res = await fetch(`${API_BASE_URL}/api/planner/unread-messages`);
    if (!res.ok) throw new Error('Failed to fetch unread messages');
    return res.json();
  },

  async getPlannerPastDue() {
    const res = await fetch(`${API_BASE_URL}/api/planner/past-due`);
    if (!res.ok) throw new Error('Failed to fetch past due items');
    return res.json();
  },

  async getPlannerAlerts() {
    const res = await fetch(`${API_BASE_URL}/api/planner/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async markPlannerMessageRead(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/planner/unread-messages/${id}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  async getReportStats() {
    const res = await fetch(`${API_BASE_URL}/api/reports/stats`);
    if (!res.ok) throw new Error('Failed to fetch report stats');
    return res.json();
  },

  async generateReport(filters: any) {
    const res = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  // Schedule Center Real-Time APIs
  async getScheduleCenterData(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/center/data/${patientId || 'default'}`);
    if (!res.ok) throw new Error('Failed to fetch schedule center data');
    return res.json();
  },

  async reassignScheduleCenterVisit(data: { visitId: string; clinicianId?: string; clinicianName: string }) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/center/reassign-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reassign visit');
    return json;
  },

  async postVisitsToAxxessCare(visitIds: string[]) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/center/post-axxess-care`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitIds }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to post visits to Axxess Care');
    return json;
  },

  async getScheduleCenterAuthorizations(patientId: string) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/center/authorizations/${patientId || 'default'}`);
    if (!res.ok) throw new Error('Failed to fetch schedule authorizations');
    return res.json();
  },

  // Reassign Schedule APIs
  async getEligibleReassignTasks(params: { employeeFrom?: string; dateFrom?: string; dateTo?: string }) {
    const query = new URLSearchParams();
    if (params.employeeFrom) query.set('employeeFrom', params.employeeFrom);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    const res = await fetch(`${API_BASE_URL}/api/schedule/reassign/eligible-tasks?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch eligible tasks for reassignment');
    return res.json();
  },

  async executeReassignSchedule(data: {
    employeeFrom?: string;
    employeeTo: string;
    dateFrom?: string;
    dateTo?: string;
    visitIds?: string[];
  }) {
    const res = await fetch(`${API_BASE_URL}/api/schedule/reassign/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to execute schedule reassignment');
    return json;
  },

  // Unscheduled Visits Report API
  async getUnscheduledVisitsReport(filters: {
    branch?: string;
    dateFrom?: string;
    dateTo?: string;
    disciplines?: string[];
    payers?: string[];
  }) {
    const res = await fetch(`${API_BASE_URL}/api/reports/unscheduled-visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate unscheduled visits report');
    return json;
  },

  async getScheduleReportMetadata() {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-report/metadata`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch schedule report metadata');
    return json;
  },

  async generateScheduleReport(filters: any) {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-report/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate schedule report');
    return json;
  },

  async exportScheduleReportExcel(filters: any) {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-report/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    if (!res.ok) throw new Error('Failed to export schedule report to Excel');
    return await res.blob();
  },

  async reassignScheduleReportVisits(payload: {
    visitIds: string[];
    replacementClinicianId?: string;
    replacementClinicianName: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-report/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to reassign schedule visits');
    return json;
  },

  async getScheduleDeviationMetadata() {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-deviation/metadata`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch schedule deviation metadata');
    return json;
  },

  async getScheduleDeviationReport(params: {
    branch?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const query = new URLSearchParams();
    if (params.branch) query.set('branch', params.branch);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));

    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-deviation?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch schedule deviation report');
    return json;
  },

  async exportScheduleDeviationExcel(filters: {
    branch?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/reports/schedule-deviation/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });
    if (!res.ok) throw new Error('Failed to export schedule deviation report to Excel');
    return await res.blob();
  },

  async getReportCenterCategories() {
    const res = await fetch(`${API_BASE_URL}/api/reports/center/categories`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch report categories');
    return json;
  },

  async getReportCenterReports(params?: { categorySlug?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.categorySlug && params.categorySlug !== 'all') {
      query.set('categorySlug', params.categorySlug);
    }
    if (params?.search) {
      query.set('search', params.search);
    }
    const res = await fetch(`${API_BASE_URL}/api/reports/center/reports?${query.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch report center reports');
    return json;
  },
};

export const scheduleApi = api;
