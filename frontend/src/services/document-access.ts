import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

async function getHeaders() {
  const session = await fetchAuthSession();

  const token =
    session.tokens?.accessToken?.toString();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function getDocumentAccess(
  documentId: string
) {
  const response = await fetch(
    `${API_URL}/documents/${documentId}/access`,
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

export async function updateDocumentAccess(
  documentId: string,
  userIds: string[]
) {
  const response = await fetch(
    `${API_URL}/api/v1/documents/${documentId}/access`,
    {
      method: "PUT",
      headers: await getHeaders(),
      body: JSON.stringify({
        userIds
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update document access"
    );
  }

  return response.json();
}