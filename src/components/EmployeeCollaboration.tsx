import { useEffect, useState } from "react";

import type { AegisElement } from "../canvas/types";

type CollaborationPermission =
  | "read"
  | "write";

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

  eligible: boolean;

  permission:
    | CollaborationPermission
    | null;

  board: CollaborationBoard | null;
};

type EmployeeCollaborationProps = {
  onClose: () => void;

  onJoined: (
    session: CollaborationSession,
  ) => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

function EmployeeCollaboration({
  onClose,
  onJoined,
}: EmployeeCollaborationProps) {
  const [session, setSession] =
    useState<CollaborationSession | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [joining, setJoining] =
    useState(false);

  const [joined, setJoined] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

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
          "Content-Type":
            "application/json",

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
              (
                data as {
                  detail?: unknown;
                }
              ).detail ??
                "Request failed.",
            )
          : "Request failed.";

      throw new Error(detail);
    }

    return data as T;
  };

  useEffect(() => {
    const loadActiveCollaboration =
      async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
          const activeSession =
            await request<
              CollaborationSession | null
            >(
              "/api/collaboration/active",
            );

          setSession(activeSession);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to check collaboration.",
          );
        } finally {
          setLoading(false);
        }
      };

    void loadActiveCollaboration();
  }, []);

  const handleJoin = async () => {
    setError("");
    setSuccess("");
    setJoining(true);

    try {
      const joinedSession =
        await request<CollaborationSession>(
          "/api/collaboration/join",
          {
            method: "POST",
          },
        );

      if (
        !joinedSession.board ||
        !joinedSession.permission
      ) {
        throw new Error(
          "The shared board could not be loaded.",
        );
      }

      if (
        typeof joinedSession.board.canvasBackground !==
          "string" ||
        !["light", "dark", "system"].includes(
          joinedSession.board.theme,
        )
      ) {
        throw new Error(
          "The shared board appearance could not be loaded.",
        );
      }

      console.log(
        "COLLAB BOARD RECEIVED:",
        joinedSession.board,
      );

      setSession({
        ...joinedSession,
        eligible: true,
      });

      setJoined(true);

      setSuccess(
        "You joined the collaboration successfully.",
      );

      onJoined(joinedSession);
    } catch (joinError) {
      setError(
        joinError instanceof Error
          ? joinError.message
          : "Failed to join collaboration.",
      );
    } finally {
      setJoining(false);
    }
  };

  const permission =
    session?.permission;

  return (
    <div
      className="aegis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-collaboration-title"
    >
      <div className="aegis-employee-modal">
        <div className="aegis-employee-header">
          <div>
            <div
              id="employee-collaboration-title"
              className="aegis-employee-title"
            >
              Live Collaboration
            </div>

            <div className="aegis-employee-subtitle">
              {joined
                ? "You are connected to the shared workspace"
                : "Join an active shared workspace"}
            </div>
          </div>

          <button
            type="button"
            className="aegis-employee-close"
            onClick={onClose}
            aria-label="Close collaboration"
          >
            ×
          </button>
        </div>

        <div className="aegis-employee-content">
          {loading ? (
            <div className="aegis-employee-empty">
              Checking available collaboration...
            </div>
          ) : !session ? (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                No Collaboration Available
              </div>

              <div className="aegis-employee-empty">
                There is currently no active
                collaboration session.
              </div>
            </section>
          ) : joined ? (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                Collaboration Joined
              </div>

              {permission === "read" ? (
                <>
                  <div className="aegis-employee-success">
                    You have READ access.
                  </div>

                  <div className="aegis-employee-empty">
                    The admin's board is now loaded.
                    You can view it, but you cannot
                    modify it.
                  </div>
                </>
              ) : (
                <>
                  <div className="aegis-employee-success">
                    You have READ + WRITE access.
                  </div>

                  <div className="aegis-employee-empty">
                    The admin's board is now loaded.
                    You can view and modify it.
                  </div>
                </>
              )}

              {success && (
                <div
                  className="aegis-employee-success"
                  role="status"
                >
                  {success}
                </div>
              )}
            </section>
          ) : !session.eligible ? (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                Collaboration Active
              </div>

              <div className="aegis-employee-empty">
                A collaboration session is
                currently active, but you are
                not eligible to join it.
              </div>

              <div className="aegis-login-error">
                You were not selected by the
                administrator for this session.
              </div>
            </section>
          ) : (
            <section className="aegis-employee-list-section">
              <div className="aegis-employee-section-title">
                Collaboration Available
              </div>

              <div className="aegis-employee-empty">
                The administrator has invited
                you to join the shared workspace.
              </div>

              <div className="aegis-employee-row">
                <div className="aegis-employee-info">
                  <div className="aegis-employee-name">
                    Your Permission
                  </div>

                  <div className="aegis-employee-email">
                    {permission === "read"
                      ? "You can view the shared board."
                      : "You can view and modify the shared board."}
                  </div>
                </div>

                <div className="aegis-employee-status active">
                  {permission?.toUpperCase()}
                </div>
              </div>

              {error && (
                <div
                  className="aegis-login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                className="aegis-login-button"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining
                  ? "Joining..."
                  : "Join Collaboration"}
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeCollaboration;