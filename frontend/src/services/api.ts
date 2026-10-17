import {
  User,
  TokenResponse,
  DatasetMetadata,
  DatasetPreviewResponse,
  ExperimentSummary,
  ExperimentDetail,
  CircuitPreviewResponse,
  ExperimentRunPayload,
  ChatMessage,
  AIChatResponse,
  AIAnalyzeResponse,
  ComparisonResponse
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('qk_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = `HTTP Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Authentication Service
export const apiAuth = {
  async register(email: string, fullName: string, password?: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, password }),
    });
    localStorage.setItem('qk_token', data.access_token);
    localStorage.setItem('qk_user', JSON.stringify(data.user));
    return data;
  },

  async login(email: string, password?: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('qk_token', data.access_token);
    localStorage.setItem('qk_user', JSON.stringify(data.user));
    return data;
  },

  async sendOtp(email: string): Promise<{ message: string; email: string; otp_code?: string; expires_in_seconds: number }> {
    return request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, otpCode: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode }),
    });
    localStorage.setItem('qk_token', data.access_token);
    localStorage.setItem('qk_user', JSON.stringify(data.user));
    return data;
  },

  async demoLogin(): Promise<TokenResponse> {
    const data = await request<TokenResponse>('/auth/demo-login', {
      method: 'POST',
    });
    localStorage.setItem('qk_token', data.access_token);
    localStorage.setItem('qk_user', JSON.stringify(data.user));
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  logout(): void {
    localStorage.removeItem('qk_token');
    localStorage.removeItem('qk_user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('qk_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('qk_token');
  }
};

// Datasets Service
export const apiDatasets = {
  async getAll(): Promise<DatasetMetadata[]> {
    return request<DatasetMetadata[]>('/datasets');
  },

  async preview(payload: {
    dataset_id: string;
    sample_limit?: number;
    test_size?: number;
    noise?: number;
    random_seed?: number;
    feature_dim?: number;
    scaling?: string;
  }): Promise<DatasetPreviewResponse> {
    return request<DatasetPreviewResponse>('/datasets/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

// Quantum Circuit Service
export const apiQuantum = {
  async getCircuitPreview(payload: {
    feature_dim: number;
    reps: number;
    entanglement: string;
  }): Promise<CircuitPreviewResponse> {
    return request<CircuitPreviewResponse>('/quantum/circuit-preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

// Experiments Service
export const apiExperiments = {
  async run(payload: ExperimentRunPayload): Promise<ExperimentDetail> {
    return request<ExperimentDetail>('/experiments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAll(): Promise<ExperimentSummary[]> {
    return request<ExperimentSummary[]>('/experiments');
  },

  async getById(id: number): Promise<ExperimentDetail> {
    return request<ExperimentDetail>(`/experiments/${id}`);
  },

  async delete(id: number): Promise<{ message: string; id: number }> {
    return request<{ message: string; id: number }>(`/experiments/${id}`, {
      method: 'DELETE',
    });
  },

  async compare(experimentIds: number[]): Promise<ComparisonResponse> {
    return request<ComparisonResponse>('/experiments/compare', {
      method: 'POST',
      body: JSON.stringify({ experiment_ids: experimentIds }),
    });
  },

  getKernelCsvUrl(id: number): string {
    return `${API_BASE}/experiments/${id}/kernel.csv`;
  },

  async getReport(id: number): Promise<any> {
    return request<any>(`/experiments/${id}/report`);
  }
};

// Quantum AI Agent (Q-Copilot) Service
export const apiAIAgent = {
  async chat(payload: {
    message: string;
    experiment_id?: number | null;
    dataset_id?: string | null;
    context?: any;
    history?: ChatMessage[];
  }): Promise<AIChatResponse> {
    return request<AIChatResponse>('/ai-agent/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async analyze(experimentId: number): Promise<AIAnalyzeResponse> {
    return request<AIAnalyzeResponse>('/ai-agent/analyze', {
      method: 'POST',
      body: JSON.stringify({ experiment_id: experimentId }),
    });
  }
};
