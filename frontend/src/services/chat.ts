import {
    getAccessToken
  } from "./auth";
  
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/api/v1";
  
  export interface ChatSource {
    chunkId: string;
    documentId: string;
    fileName?: string;
    pageNumber: number | null;
    similarity: number;
  }
  
  export interface ChatResponse {
    question: string;
    answer: string;
    sources: ChatSource[];
  }

  export async function askQuestion(
    question: string
  ): Promise<ChatResponse> {
  
    const token =
      await getAccessToken();
  
    if (!token) {
      throw new Error(
        "User is not authenticated"
      );
    }
  
    const response =
      await fetch(
        `${API_BASE_URL}/chat`,
        {
          method: "POST",
  
          headers: {
            "Content-Type": "application/json",
  
            Authorization:
              `Bearer ${token}`
          },
  
          body: JSON.stringify({
            question
          })
        }
      );
  
    if (!response.ok) {
  
      const error =
        await response
          .json()
          .catch(() => null);
  
      throw new Error(
        error?.message ||
        "Failed to generate answer"
      );
    }
  
    return response.json();
  }