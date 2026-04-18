const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const { headers: customHeaders = {}, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data.message
        ? data.message
        : "Request failed";
    throw new Error(message);
  }

  return data;
}

export function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  saveProject: (token, payload) =>
    request("/projects/save", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),

  getMyProjects: (token) =>
    request("/projects/me", {
      headers: authHeaders(token),
    }),

  getProjectById: (token, projectId) =>
    request(`/projects/${projectId}`, {
      headers: authHeaders(token),
    }),

  getDownloadUrl: (projectId) =>
    `${API_BASE_URL}/projects/${projectId}/download`,
};
