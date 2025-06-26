const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async getUsers() {
    return this.request('/users');
  }

  async getFeedback() {
    return this.request('/feedback');
  }

  async createFeedback(feedbackData: {
    employeeId: string;
    strengths: string;
    areasToImprove: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async updateFeedback(feedbackId: string, feedbackData: {
    strengths?: string;
    areasToImprove?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }) {
    return this.request(`/feedback/${feedbackId}`, {
      method: 'PUT',
      body: JSON.stringify(feedbackData),
    });
  }

  async acknowledgeFeedback(feedbackId: string) {
    return this.request(`/feedback/${feedbackId}/acknowledge`, {
      method: 'POST',
    });
  }

  async getTeams() {
    return this.request('/teams');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

export const apiService = new ApiService();