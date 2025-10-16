const API_BASE_URL = 'https://functions.poehali.dev';

const AUTH_API = 'b9d6731e-788e-476b-bad5-047bd3d6adc1';
const DATA_API = 'c30e1bf9-0423-48e8-b295-07120e205fa7';
const CREATE_API = '8d57b03e-49c5-4589-abfb-691e6e084c6a';
const UPDATE_API = 'b69598bf-df90-4a71-93a1-6108c6c39317';
const INSPECTION_EVENT_API = '0b3a32ce-bc6d-455c-a189-7cd294c69c95';

export interface User {
  id: number;
  phone: string;
  email?: string;
  role: 'contractor' | 'client' | 'admin';
  name: string;
  organization?: string;
}

export interface Object {
  id: number;
  title: string;
  address?: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created_at: string;
  owner_id: number;
}

export interface Work {
  id: number;
  title: string;
  description: string;
  object_id: number;
  contractor_id?: number;
  contractor_name?: string;
  status: 'active' | 'completed' | 'pending' | 'on_hold';
  start_date?: string;
  end_date?: string;
}

export interface Inspection {
  id: number;
  work_id: number;
  inspection_number: string;
  created_by: number;
  status: 'draft' | 'active' | 'completed' | 'on_rework';
  notes?: string;
  created_at: string;
  completed_at?: string;
  inspector_name: string;
}

export interface InspectionCheckpoint {
  id: number;
  inspection_id: number;
  title: string;
  standard: string;
  status: 'ok' | 'violation' | 'pending';
}

export interface Remark {
  id: number;
  inspection_id: number;
  checkpoint_id?: number;
  description: string;
  normative_ref?: string;
  photo_urls?: string;
  status: 'open' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
}

export interface WorkLog {
  id: number;
  work_id: number;
  volume?: string;
  materials?: string;
  photo_urls?: string;
  description: string;
  created_by: number;
  created_at: string;
  author_name: string;
  author_role: 'contractor' | 'client';
  is_work_start?: boolean;
  progress?: number;
  unit?: string;
}

export interface Contractor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
}

export interface InspectionEvent {
  id: number;
  inspection_id: number;
  event_type: 'scheduled' | 'started' | 'completed';
  created_at: string;
  created_by: number;
  metadata: Record<string, any>;
  author_name?: string;
  author_role?: string;
}

export interface UserData {
  objects: Object[];
  works: Work[];
  inspections: Inspection[];
  checkpoints: InspectionCheckpoint[];
  remarks: Remark[];
  workLogs: WorkLog[];
  contractors: Contractor[];
}

export const api = {
  async login(phone: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/${AUTH_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async getUserData(token: string): Promise<UserData> {
    const response = await fetch(`${API_BASE_URL}/bdee636b-a6c0-42d0-8f77-23c316751e34`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch data');
    }

    return response.json();
  },

  async createItem(token: string, type: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${CREATE_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create item');
    }

    return response.json();
  },

  async updateItem(token: string, type: string, id: number, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${UPDATE_API}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ type, id, data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    return response.json();
  },

  async deleteItem(token: string, type: string, id: number): Promise<any> {
    const url = `${API_BASE_URL}/${UPDATE_API}`;
    const payload = { type, id };
    console.log('API: DELETE request', { url, method: 'DELETE', payload });
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(payload),
    });

    console.log('API: DELETE response', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const error = await response.json();
      console.error('API: DELETE error', error);
      throw new Error(error.error || 'Failed to delete item');
    }

    const result = await response.json();
    console.log('API: DELETE success', result);
    return result;
  },

  async getInspectionEvents(token: string, inspectionId?: number): Promise<InspectionEvent[]> {
    const url = inspectionId 
      ? `${API_BASE_URL}/${INSPECTION_EVENT_API}?inspection_id=${inspectionId}`
      : `${API_BASE_URL}/${INSPECTION_EVENT_API}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inspection events');
    }

    return response.json();
  },

  async createInspectionEvent(token: string, data: {
    inspection_id: number;
    event_type: 'scheduled' | 'started' | 'completed';
    created_by: number;
    metadata?: Record<string, any>;
  }): Promise<InspectionEvent> {
    const response = await fetch(`${API_BASE_URL}/${INSPECTION_EVENT_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create inspection event');
    }

    return response.json();
  },
};