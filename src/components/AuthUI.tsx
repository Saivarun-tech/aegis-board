import {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  login,
  logout,
  type AuthUser,
} from "../auth/authApi";

import EmployeeManagement from "./EmployeeManagement";
import AllotWork from "./AllotWork";
import MyWorks from "./MyWorks";

type AuthUIProps = {
  onAuthChange?: (
    user: AuthUser | null,
  ) => void;
};

function AuthUI({
  onAuthChange,
}: AuthUIProps) {
  const [
    currentUser,
    setCurrentUser,
  ] = useState<AuthUser | null>(null);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    employeeManagementOpen,
    setEmployeeManagementOpen,
  ] = useState(false);

  const [
    myWorksOpen,
    setMyWorksOpen,
  ] = useState(false);

  const [
    allotWorkOpen,
    setAllotWorkOpen,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * ==================================================
   * CHECK EXISTING SESSION
   * ==================================================
   */

  useEffect(() => {
    let cancelled = false;

    const checkSession =
      async () => {
        try {
          const user =
            await getCurrentUser();

          if (cancelled) {
            return;
          }

          setCurrentUser(user);
          onAuthChange?.(user);
        } catch {
          if (cancelled) {
            return;
          }

          setCurrentUser(null);
          onAuthChange?.(null);
        } finally {
          if (!cancelled) {
            setCheckingSession(false);
          }
        }
      };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [onAuthChange]);

  /*
   * ==================================================
   * OPEN LOGIN
   * ==================================================
   */

  const openLogin = () => {
    setProfileOpen(false);

    setEmail("");
    setPassword("");
    setError("");

    setModalOpen(true);
  };

  /*
   * ==================================================
   * CLOSE LOGIN
   * ==================================================
   */

  const closeLogin = () => {
    if (loading) {
      return;
    }

    setModalOpen(false);
    setError("");
  };

  /*
   * ==================================================
   * LOGIN
   * ==================================================
   */

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );

      return;
    }

    try {
      setLoading(true);

      const user =
        await login({
          email: cleanEmail,
          password,
        });

      setCurrentUser(user);

      onAuthChange?.(user);

      setModalOpen(false);

      setEmail("");
      setPassword("");
      setError("");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==================================================
   * LOGOUT
   * ==================================================
   */

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /*
       * Even if the server session is already
       * unavailable, clear the local UI state.
       */
    }

    setCurrentUser(null);
    setProfileOpen(false);
    setEmployeeManagementOpen(false);
    setAllotWorkOpen(false);
    setMyWorksOpen(false);

    onAuthChange?.(null);
  };

  /*
   * ==================================================
   * SESSION CHECK LOADING
   * ==================================================
   */

  if (checkingSession) {
    return (
      <div className="aegis-auth-loading">
        <div className="aegis-auth-loading-card">
          <div className="aegis-auth-loading-logo">
            A
          </div>

          <div className="aegis-auth-loading-title">
            AEGIS
          </div>

          <div className="aegis-auth-loading-text">
            Checking your session...
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==================================================
   * AUTHENTICATED USER
   * ==================================================
   */

  if (currentUser) {
    return (
      <>
        <div className="aegis-auth-area">
          <div className="aegis-profile-wrapper">
            <button
              type="button"
              className="aegis-profile-button"
              onClick={() =>
                setProfileOpen(
                  (value) => !value,
                )
              }
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <span className="aegis-profile-avatar">
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </span>

              <span className="aegis-profile-name">
                {currentUser.name}
              </span>

              <span className="aegis-profile-chevron">
                ▾
              </span>
            </button>

            {profileOpen && (
              <div className="aegis-profile-menu">
                <div className="aegis-profile-header">
                  <span className="aegis-profile-avatar large">
                    {currentUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div>
                    <strong>
                      {currentUser.name}
                    </strong>

                    <span>
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <div className="aegis-profile-role">
                  <span>
                    Role
                  </span>

                  <strong>
                    {currentUser.role ===
                    "admin"
                      ? "Admin"
                      : "Employee"}
                  </strong>
                </div>

                {currentUser.must_change_password && (
                  <div className="aegis-profile-notice">
                    <strong>
                      First login
                    </strong>

                    <span>
                      Password setup is required.
                    </span>
                  </div>
                )}

                {/* ======================================
                    MY WORKS
                    ====================================== */}

                <button
                  type="button"
                  className="aegis-profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    setMyWorksOpen(true);
                  }}
                >
                  <span>
                    My Works
                  </span>

                  <span>
                    →
                  </span>
                </button>

                {/* ======================================
                    PROFILE
                    ====================================== */}

                <button
                  type="button"
                  className="aegis-profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);

                    window.alert(
                      "Profile settings are coming next.",
                    );
                  }}
                >
                  <span>
                    Profile
                  </span>

                  <span>
                    →
                  </span>
                </button>

                {/* ======================================
                    ADMIN FEATURES
                    ====================================== */}

                {currentUser.role === "admin" && (
                  <>
                    <button
                      type="button"
                      className="aegis-profile-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        setEmployeeManagementOpen(
                          true,
                        );
                      }}
                    >
                      <span>
                        Employee Management
                      </span>

                      <span>
                        →
                      </span>
                    </button>

                    <button
                      type="button"
                      className="aegis-profile-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        setAllotWorkOpen(true);
                      }}
                    >
                      <span>
                        Allot Work
                      </span>

                      <span>
                        →
                      </span>
                    </button>
                  </>
                )}

                <div className="aegis-profile-divider" />

                {/* ======================================
                    LOG OUT
                    ====================================== */}

                <button
                  type="button"
                  className="aegis-profile-menu-item danger"
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  <span>
                    Log out
                  </span>

                  <span>
                    ↗
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================
            EMPLOYEE MANAGEMENT
            ============================================ */}

        {employeeManagementOpen && (
          <EmployeeManagement
            onClose={() =>
              setEmployeeManagementOpen(false)
            }
          />
        )}

        {/* ============================================
            ALLOT WORK
            ============================================ */}

        {allotWorkOpen && (
          <AllotWork
            onClose={() =>
              setAllotWorkOpen(false)
            }
          />
        )}

        {/* ============================================
            MY WORKS
            ============================================ */}

        {myWorksOpen && (
          <MyWorks
            onClose={() =>
              setMyWorksOpen(false)
            }
          />
        )}
      </>
    );
  }

  /*
   * ==================================================
   * NOT AUTHENTICATED
   * ==================================================
   */

  return (
    <>
      <div className="aegis-auth-area">
        <button
          type="button"
          className="aegis-auth-button primary"
          onClick={openLogin}
        >
          Login
        </button>
      </div>

      {modalOpen && (
        <div
          className="aegis-auth-overlay"
          onPointerDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLogin();
            }
          }}
        >
          <div className="aegis-auth-modal">
            <button
              type="button"
              className="aegis-auth-close"
              onClick={closeLogin}
              aria-label="Close login"
              disabled={loading}
            >
              ×
            </button>

            <div className="aegis-auth-brand">
              <div className="aegis-auth-logo">
                A
              </div>

              <div>
                <strong>
                  Aegis
                </strong>

                <span>
                  Private workspace
                </span>
              </div>
            </div>

            <div className="aegis-auth-heading">
              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to your
                Aegis workspace.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
            >
              <label className="aegis-auth-field">
                <span>
                  Email address
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event,
                  ) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  autoFocus
                />
              </label>

              <label className="aegis-auth-field">
                <span>
                  Password
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </label>

              {error && (
                <div
                  className="aegis-auth-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="aegis-auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <div className="aegis-auth-footer">
              Aegis Board · Private workspace
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthUI;