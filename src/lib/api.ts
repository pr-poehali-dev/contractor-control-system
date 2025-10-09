const API_BASE_URL = 'https://functions.poehali.dev';

const AUTH_API = 'b9d6731e-788e-476b-bad5-047bd3d6adc1';
const DATA_API = 'c30e1bf9-0423-48e8-b295-07120e205fa7';
const CREATE_API = '8d57b03e-49c5-4589-abfb-691e6e084c6a';
const UPDATE_API = 'b69598bf-df90-4a71-93a1-6108c6c39317';

export interface User {
  id: number;
  phone: string;
  email?: string;
  role: 'contractor' | 'client' | 'admin';
  name: string;
  organization?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  created_at: string;
}

export interface Site {
  id: number;
  title: string;
  address: string;
  project_id: number;
  status: 'active' | 'completed' | 'pending' | 'archived';
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
}

export interface Contractor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
}

export interface UserData {
  projects: Project[];
  sites: Site[];
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
    const response = await fetch(`${API_BASE_URL}/${UPDATE_API}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ type, id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    return response.json();
  },
};