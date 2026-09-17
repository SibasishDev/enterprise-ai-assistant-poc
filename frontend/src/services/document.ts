import { getAccessToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

  interface UploadUrlResponse {
    documentId: string;
    uploadUrl: string;
    expiresIn: number;
  }

  interface CreateUploadUrlRequest {
    fileName: string;
    contentType: string;
    fileSize: number;
    departmentId: string;
    category: string;
    documentType?: string,
    accessLevel?: string
  }

  export async function createUploadUrl(data: CreateUploadUrlRequest): Promise<UploadUrlResponse> {
    const token = await getAccessToken();

    if (!token) {
        throw new Error("User is not authenticated");
      }

      const response = await fetch(
        `${API_BASE_URL}/documents/upload-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        }
      );

      if(!response.ok){
        const error = await response.json().catch(() => null);

        throw new Error(error?.message || "Failed to generate upload URL");
      }

      return response.json();
  }