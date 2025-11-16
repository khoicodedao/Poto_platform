// API client for making HTTP requests
class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    // Trong Server Actions, chúng ta cần URL đầy đủ
    if (typeof window === "undefined") {
      // Server side - sử dụng Replit domain hoặc localhost
      this.baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/api` : "http://localhost:5000/api"
    } else {
      // Client side - có thể sử dụng relative path
      this.baseUrl = baseUrl || "/api"
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T; success: boolean; error?: string }> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log("Making request to:", url)

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          data: data,
          success: false,
          error: data.message || "Something went wrong",
        }
      }

      return {
        data: data,
        success: true,
      }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        data: {} as T,
        success: false,
        error: "Network error",
      }
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<{ data: T; success: boolean; error?: string }> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<{ data: T; success: boolean; error?: string }> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<{ data: T; success: boolean; error?: string }> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<{ data: T; success: boolean; error?: string }> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
