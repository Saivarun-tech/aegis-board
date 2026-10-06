export type AuthUser = {
  id: string;
  name: string;
  email: string;
  employee_code: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

const request = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    },
  );

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? String(
            (data as { detail?: unknown }).detail ??
              "Request failed.",
          )
        : "Request failed.";

    throw new Error(detail);
  }

  return data as T;
};

// ==================================================
// AUTHENTICATION
// ==================================================

export const login = async (
  payload: LoginPayload,
): Promise<AuthUser> => {
  return request<AuthUser>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};

export const getCurrentUser =
  async (): Promise<AuthUser> => {
    return request<AuthUser>(
      "/api/auth/me",
      {
        method: "GET",
      },
    );
  };

export const logout = async (): Promise<void> => {
  await request<{ message: string }>(
    "/api/auth/logout",
    {
      method: "POST",
    },
  );
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await request<{ message: string }>(
    "/api/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    },
  );
};

export const firstLoginSetup = async (
  currentPassword: string,
  newPassword: string,
  email: string,
): Promise<AuthUser> => {
  return request<AuthUser>(
    "/api/auth/first-login",
    {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        email,
      }),
    },
  );
};

export const updateProfile = async (
  name?: string,
  email?: string,
): Promise<AuthUser> => {
  return request<AuthUser>(
    "/api/auth/profile",
    {
      method: "PATCH",
      body: JSON.stringify({
        ...(name !== undefined
          ? { name }
          : {}),
        ...(email !== undefined
          ? { email }
          : {}),
      }),
    },
  );
};

// ==================================================
// EMPLOYEE MANAGEMENT
// ==================================================

export type Employee = {
  id: string;
  employee_code: string | null;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
};

export type CreateEmployeePayload = {
  employee_code: string;
  name: string;
  email: string;
  temporary_password: string;
};

export const getEmployees =
  async (): Promise<Employee[]> => {
    return request<Employee[]>(
      "/api/employees",
      {
        method: "GET",
      },
    );
  };

export const createEmployee = async (
  payload: CreateEmployeePayload,
): Promise<Employee> => {
  return request<Employee>(
    "/api/employees",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};
// WORK MANAGEMENT
// ==================================================

export type Work = {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  status: string;
  created_by: string;
};

export type CreateWorkPayload = {
  employee_id: string;
  title: string;
  description: string;
};

export const createWork = async (
  payload: CreateWorkPayload,
): Promise<Work> => {
  return request<Work>(
    "/api/works",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
};
export const getMyWorks = async (): Promise<Work[]> => {
  return request<Work[]>(
    "/api/works/",
    {
      method: "GET",
    },
  );
};