import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

  async function getHeaders() {
    const session = await fetchAuthSession();
  
    const token =
      session.tokens?.accessToken?.toString();
  
    const email =
      session.tokens?.idToken?.payload?.email;
  
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-User-Email": String(email ?? "")
    };
  }

export async function getDepartments() {
    const response = await fetch(
        `${API_BASE_URL}/departments`,
        {
            headers: await getHeaders()
        }
      );
    
      if (!response.ok) {
        throw new Error(
          "Failed to load document access"
        );
      }
    
      return response.json();
}