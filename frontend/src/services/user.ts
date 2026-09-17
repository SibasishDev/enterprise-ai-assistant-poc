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

export async function getMe() {
  const response = await fetch(
    `${API_BASE_URL}/users/me`,
    {
      headers: await getHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get current user");
  }

  return response.json();
}

export async function getUsers() {
  const response = await fetch(
    `${API_BASE_URL}/users/`,
    {
      headers: await getHeaders()
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get users");
  }

  return response.json();
}

export async function updateUserRole(
  userId: string,
  role: string
) {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/role`,
    {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify({
        role
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update role");
  }

  return response.json();
}

export async function updateUser(
  userId: string,
  data: {
    jobTitle?: string;
    location?: string;
    isActive?: boolean;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}`,
    {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
}

export async function toggleUserDepartment(userId: string, departmentId: string, assign: boolean) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/update-departments`, {
      method: "PATCH",
      headers: await getHeaders(),
      body: JSON.stringify({ departmentId, assign }) // assign is a boolean flag (true = link, false = delete)
    });
  
    if (!response.ok) {
      throw new Error("Failed to modify user department routing matrix configuration.");
    }
    return response.json();
  }