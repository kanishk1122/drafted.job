export class ApiService {
  protected baseUrl: string;

  constructor() {
    // Must match the backend host so browser sends the httponly cookie (localhost ≠ 127.0.0.1)
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Token resolution: Electron native store → localStorage (web browser)
    let authHeader: Record<string, string> = {};
    if (typeof window !== "undefined") {
      let token: string | null = null;
      if ((window as any).electron) {
        try {
          token = await (window as any).electron.invoke('get-auth-cookie', 'access_token');
        } catch (e) {
          console.error("Failed to retrieve native auth cookie", e);
        }
      }
      if (!token) token = localStorage.getItem('access_token');
      if (token) authHeader = { "Authorization": `Bearer ${token}` };
    }

    const defaultOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...options.headers,
      },
      // Browser: httponly cookie sent automatically when same host (localhost)
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
