// Kite Connect Authentication Service
const KITE_BASE_URL = 'https://kite.zerodha.com/connect/login';

export class KiteAuth {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_ZERODHA_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_ZERODHA_API_SECRET || '';
  }

  // Step 1: Get login URL
  getLoginUrl(redirectUrl: string = window.location.origin): string {
    return `${KITE_BASE_URL}?api_key=${this.apiKey}&v=3`;
  }

  // Step 2: Exchange request token for access token
  async getAccessToken(requestToken: string): Promise<string> {
    try {
      const response = await fetch('https://api.kite.trade/session/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          request_token: requestToken,
          checksum: this.generateChecksum(this.apiKey + requestToken + this.apiSecret)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      return data.data.access_token;
    } catch (error) {
      console.error('Kite auth error:', error);
      throw error;
    }
  }

  // Generate checksum using SHA256
  private generateChecksum(data: string): string {
    // In production, use crypto library for SHA256
    // For now, return a mock checksum
    return 'mock_checksum_' + btoa(data).slice(0, 32);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('kite_access_token');
  }

  // Get stored access token
  getStoredAccessToken(): string | null {
    return localStorage.getItem('kite_access_token');
  }

  // Store access token
  storeAccessToken(token: string): void {
    localStorage.setItem('kite_access_token', token);
  }

  // Clear authentication
  logout(): void {
    localStorage.removeItem('kite_access_token');
  }
}

export const kiteAuth = new KiteAuth();