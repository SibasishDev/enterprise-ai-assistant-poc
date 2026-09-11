const API_URL = "http://localhost:3000/api/v1";
import { getAccessToken } from "./auth";

export async function getProfile() {
    const token = await getAccessToken();

    const response = await fetch(`${API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if(!response.ok){
        throw new Error('Failed to get profile');
    }

    return response.json();
}

export async function getHealth() {
  const response = await fetch(
    `${API_URL}/health`
  );

  if (!response.ok) {
    throw new Error("API request failed");
  }

  console.log(response);

  return response.json();
}