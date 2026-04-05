export class ApiService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // 1. Manually pull the token from Electron's native store
    let authHeader = {};
    if (typeof window !== "undefined" && (window as any).electron) {
      try {
        const token = await (window as any).electron.invoke('get-auth-cookie', 'access_token');
        if (token) {
          authHeader = { "Authorization": `Bearer ${token}` };
        }
      } catch (e) {
        console.error("Failed to retrieve native auth cookie", e);
      }
    }

    const defaultOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader, // 2. Inject the manual header
        ...options.headers,
      },
      credentials: "include",
    };

    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Integrated API Protocol Error");
    }

    return data as T;
  }
}
