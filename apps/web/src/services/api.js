const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return result;
  }

  async verifyEmail(verificationData) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async resendVerification(email) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  // Availability methods
  async getAvailabilityRules() {
    return this.request('/me/availability-rules');
  }

  async createAvailabilityRule(ruleData) {
    return this.request('/me/availability-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  async getExceptions() {
    return this.request('/me/exceptions');
  }

  async createException(exceptionData) {
    return this.request('/me/exceptions', {
      method: 'POST',
      body: JSON.stringify(exceptionData),
    });
  }

  // Links methods
  async getLinks() {
    return this.request('/me/links');
  }

  async createLink(linkData) {
    return this.request('/me/links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  }

  // Analytics methods
  async getLinkAnalytics() {
    return this.request('/me/analytics/links');
  }

  // Public methods
  async getPublicAvailability(slug) {
    return this.request(`/public/${slug}/availability`);
  }
}

export default new ApiService();
