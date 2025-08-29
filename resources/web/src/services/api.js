const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
console.log('API_BASE_URL:', API_BASE_URL);

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
      credentials: 'include', // Include credentials for CORS
      ...options,
    };

    // Debug logging for timezone issues
    if (endpoint.includes('/me') || endpoint.includes('profile')) {
      console.log('API Request:', {
        method: options.method || 'GET',
        url,
        hasToken: !!this.token
      });
    }

    try {
      const response = await fetch(url, config);
      

      
      const data = await response.json();
      
      // Debug logging for timezone issues
      if (endpoint.includes('/me') || endpoint.includes('profile')) {
        console.log('API Response:', { status: response.status, data });
      }

      if (!response.ok) {
        // Create an error object that includes the response data
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Check if response body contains an error message even with 200 status
      if (data.error || data.message === 'Something went wrong') {
        const error = new Error(data.message || data.error || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
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
  async getPublicAvailability(slug, range = null) {
    const endpoint = range 
      ? `/public/${slug}/availability?range=${range}`
      : `/public/${slug}/availability`;
    return this.request(endpoint);
  }

  // HTTP method helpers
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiService = new ApiService();

export { apiService as api };
export default apiService;
