import {
  useState,
  type FormEvent,
} from "react";

import {
  login,
  type AuthUser,
} from "./authApi";

type LoginScreenProps = {
  onLogin: (user: AuthUser) => void;
};

function LoginScreen({
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
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

      const user = await login({
        email: cleanEmail,
        password,
      });

      onLogin(user);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="aegis-login-page">
      {/* Background */}
      <div
        className="aegis-login-background"
        aria-hidden="true"
      />

      <div
        className="aegis-login-overlay"
        aria-hidden="true"
      />

      {/* Top-center branding */}
      <header className="aegis-login-brand">
        <div className="aegis-login-mark">
          <span>A</span>
        </div>

        <div className="aegis-login-brand-name">
          <span className="aegis-login-brand-aegis">
            Aegis
          </span>

          <span className="aegis-login-brand-board">
            Board
          </span>
        </div>

        <div className="aegis-login-tagline">
          VISUAL COLLABORATION
        </div>
      </header>

      {/* Main content */}
      <section className="aegis-login-content">
        <div className="aegis-login-intro">
          <div className="aegis-login-eyebrow">
            PRIVATE WORKSPACE
          </div>

          <h1>
            Turn ideas
            <br />
            into{" "}
            <span>reality.</span>
          </h1>

          <p>
            Aegis Board gives your team a shared
            canvas to plan, collaborate, and create
            without limits.
          </p>

          <div className="aegis-login-features">
            <div className="aegis-login-feature">
              <div className="aegis-login-feature-icon">
                ◇
              </div>

              <div>
                <strong>
                  Visual Workspace
                </strong>

                <span>
                  Sketch, plan and organize.
                </span>
              </div>
            </div>

            <div className="aegis-login-feature">
              <div className="aegis-login-feature-icon">
                ↗
              </div>

              <div>
                <strong>
                  Real-time Collaboration
                </strong>

                <span>
                  Work together, anywhere.
                </span>
              </div>
            </div>

            <div className="aegis-login-feature">
              <div className="aegis-login-feature-icon">
                ◈
              </div>

              <div>
                <strong>
                  Secure &amp; Reliable
                </strong>

                <span>
                  Your ideas stay protected.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="aegis-login-card">
          <div className="aegis-login-card-glow" />

          <div className="aegis-login-card-content">
            <div className="aegis-login-heading">
              <div className="aegis-login-small-label">
                AEGIS BOARD
              </div>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to your
                workspace.
              </p>
            </div>

            <form
              className="aegis-login-form"
              onSubmit={handleSubmit}
            >
              <label className="aegis-login-field">
                <span>
                  Email address
                </span>

                <div className="aegis-login-input-wrap">
                

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </label>

              <label className="aegis-login-field">
                <span>
                  Password
                </span>

                <div className="aegis-login-input-wrap">
                  

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="aegis-login-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  className="aegis-login-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="aegis-login-options">
                <label className="aegis-login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    disabled={loading}
                  />

                  <span>
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="aegis-login-forgot"
                  onClick={() =>
                    setError(
                      "Please contact your Aegis administrator to reset your password.",
                    )
                  }
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="aegis-login-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </span>

                {!loading && (
                  <span className="aegis-login-arrow">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="aegis-login-security">
              <span className="aegis-login-security-dot" />

              <span>
                Secure private workspace
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom information */}
      <footer className="aegis-login-footer">
        <span>
          Plan
        </span>

        <i />

        <span>
          Collaborate
        </span>

        <i />

        <span>
          Visualize
        </span>

        <i />

        <span>
          Achieve
        </span>
      </footer>
    </main>
  );
}

export default LoginScreen;