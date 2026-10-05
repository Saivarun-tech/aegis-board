import { useEffect, useState } from "react";
import type { AegisElement } from "../canvas/types";

type Employee = {
  id: string;
  employee_code: string | null;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type CollaborationPermission = "read" | "write";

type CollaborationParticipant = {
  employee_id: string;
  permission: CollaborationPermission;
  joined_at: string | null;
  left_at: string | null;
};

type CollaborationBoard = {
  elements: AegisElement[];
  pan: {
    x: number;
    y: number;
  };
  canvasBackground: string;
  theme: "light" | "dark" | "system";
};

type CollaborationSession = {
  id: string;
  status: string;
  started_by: string;
  created_at: string;
  participants: CollaborationParticipant[];
  board?: CollaborationBoard | null;
};

type CollaborationManagementProps = {
  onClose: () => void;
  elements: AegisElement[];
  pan: {
    x: number;
    y: number;
  };
  onStarted: (session: CollaborationSession) => void;
  onEnded: () => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

function CollaborationManagement({
  onClose,
  elements,
  pan,
  onStarted,
  onEnded,
}: CollaborationManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<
    Record<string, CollaborationPermission>
  >({});
  const [activeSession, setActiveSession] =
    useState<CollaborationSession | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const request = async <T,>(
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

  useEffect(() => {
    const loadCollaborationData = async () => {
      setLoading(true);
      setError("");

      try {
        const [employeeData, session] =
          await Promise.all([
            request<Employee[]>("/api/employees"),
            request<CollaborationSession | null>(
              "/api/collaboration/active",
            ),
          ]);

        const activeEmployees = employeeData.filter(
          (employee) => employee.is_active,
        );

        setEmployees(activeEmployees);
        setActiveSession(session);

        const initialPermissions: Record<
          string,
          CollaborationPermission
        > = {};

        activeEmployees.forEach((employee) => {
          initialPermissions[employee.id] = "read";
        });

        if (session) {
          session.participants.forEach((participant) => {
            initialPermissions[participant.employee_id] =
              participant.permission;
          });
        }

        setPermissions(initialPermissions);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load collaboration data.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCollaborationData();
  }, []);

  const toggleEmployee = (employeeId: string) => {
    setPermissions((current) => {
      const next = { ...current };

      if (next[employeeId]) {
        delete next[employeeId];
      } else {
        next[employeeId] = "read";
      }

      return next;
    });

    setError("");
    setSuccess("");
  };

  const setPermission = (
    employeeId: string,
    permission: CollaborationPermission,
  ) => {
    setPermissions((current) => ({
      ...current,
      [employeeId]: permission,
    }));

    setError("");
    setSuccess("");
  };

  const handleStart = async () => {
    setError("");
    setSuccess("");

    const participants = Object.entries(
      permissions,
    ).map(([employee_id, permission]) => ({
      employee_id,
      permission,
    }));

    if (participants.length === 0) {
      setError("Select at least one employee.");
      return;
    }

    setStarting(true);

    try {
      const root = document.documentElement;

      const canvasBackground =
        getComputedStyle(root)
          .getPropertyValue("--aegis-canvas-bg")
          .trim() || "#ffffff";

      const theme =
        root.dataset.theme === "dark"
          ? "dark"
          : root.dataset.theme === "light"
            ? "light"
            : "system";

      const session =
        await request<CollaborationSession>(
          "/api/collaboration/start",
          {
            method: "POST",
            body: JSON.stringify({
              participants,
              board: {
                elements: structuredClone(elements),
                pan: {
                  x: pan.x,
                  y: pan.y,
                },
                canvasBackground,
                theme,
              },
            }),
          },
        );

      setActiveSession(session);
      onStarted(session);

      setSuccess(
        "Collaboration started successfully.",
      );
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Failed to start collaboration.",
      );
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    setError("");
    setSuccess("");
    setEnding(true);

    try {
      await request<CollaborationSession>(
        "/api/collaboration/end",
        {
          method: "POST",
        },
      );

      setActiveSession(null);

      onEnded();

      setSuccess(
        "Collaboration ended successfully.",
      );
    } catch (endError) {
      setError(
        endError instanceof Error
          ? endError.message
          : "Failed to end collaboration.",
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <div
      className="aegis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaboration-management-title"
    >
      <div className="aegis-employee-modal">
        <div className="aegis-employee-header">
          <div>
            <div
              id="collaboration-management-title"
              className="aegis-employee-title"
            >
              Live Collaboration
            </div>

            <div className="aegis-employee-subtitle">
              Choose who can join this shared workspace
            </div>
          </div>

          <button
            type="button"
            className="aegis-employee-close"
            onClick={onClose}
            aria-label="Close collaboration management"
          >
            ×
          </button>
        </div>

        <div className="aegis-employee-content">
          {loading ? (
            <div className="aegis-employee-empty">
              Loading collaboration data...
            </div>
          ) : activeSession ? (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                Collaboration Active
              </div>

              <div className="aegis-employee-subtitle">
                The shared workspace is currently active.
              </div>

              <div className="aegis-employee-list">
                {activeSession.participants.map(
                  (participant) => {
                    const employee =
                      employees.find(
                        (item) =>
                          item.id ===
                          participant.employee_id,
                      );

                    return (
                      <article
                        key={participant.employee_id}
                        className="aegis-employee-row"
                      >
                        <div className="aegis-employee-info">
                          <div className="aegis-employee-name">
                            {employee?.name ??
                              "Employee"}
                          </div>

                          <div className="aegis-employee-email">
                            {employee?.employee_code ??
                              "—"}{" "}
                            ·{" "}
                            {employee?.email ?? ""}
                          </div>
                        </div>

                        <div className="aegis-employee-status active">
                          {participant.permission.toUpperCase()}
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              {error && (
                <div
                  className="aegis-login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="aegis-employee-success"
                  role="status"
                >
                  {success}
                </div>
              )}

              <button
                type="button"
                className="aegis-login-button"
                onClick={handleEnd}
                disabled={ending}
              >
                {ending
                  ? "Ending..."
                  : "End Collaboration"}
              </button>
            </section>
          ) : (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                Select Employees
              </div>

              <div className="aegis-employee-subtitle">
                Selected employees will be able to join
                this collaboration session.
              </div>

              <div className="aegis-employee-list">
                {employees.length === 0 ? (
                  <div className="aegis-employee-empty">
                    No active employees available.
                  </div>
                ) : (
                  employees.map((employee) => {
                    const selected =
                      Boolean(
                        permissions[employee.id],
                      );

                    return (
                      <article
                        key={employee.id}
                        className="aegis-employee-row"
                      >
                        <div className="aegis-employee-info">
                          <div className="aegis-employee-name">
                            {employee.name}
                          </div>

                          <div className="aegis-employee-email">
                            {employee.employee_code ??
                              "—"}{" "}
                            · {employee.email}
                          </div>
                        </div>

                        <div className="aegis-collaboration-controls">
                          <button
                            type="button"
                            className={
                              selected
                                ? "aegis-collaboration-select selected"
                                : "aegis-collaboration-select"
                            }
                            onClick={() =>
                              toggleEmployee(
                                employee.id,
                              )
                            }
                          >
                            {selected
                              ? "Selected"
                              : "Select"}
                          </button>

                          {selected && (
                            <div className="aegis-collaboration-permissions">
                              <button
                                type="button"
                                className={
                                  permissions[
                                    employee.id
                                  ] === "read"
                                    ? "aegis-collaboration-permission active"
                                    : "aegis-collaboration-permission"
                                }
                                onClick={() =>
                                  setPermission(
                                    employee.id,
                                    "read",
                                  )
                                }
                              >
                                READ
                              </button>

                              <button
                                type="button"
                                className={
                                  permissions[
                                    employee.id
                                  ] === "write"
                                    ? "aegis-collaboration-permission active"
                                    : "aegis-collaboration-permission"
                                }
                                onClick={() =>
                                  setPermission(
                                    employee.id,
                                    "write",
                                  )
                                }
                              >
                                WRITE
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {error && (
                <div
                  className="aegis-login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="aegis-employee-success"
                  role="status"
                >
                  {success}
                </div>
              )}

              <button
                type="button"
                className="aegis-login-button"
                onClick={handleStart}
                disabled={
                  starting ||
                  employees.length === 0
                }
              >
                {starting
                  ? "Starting..."
                  : "Start Collaboration"}
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborationManagement;