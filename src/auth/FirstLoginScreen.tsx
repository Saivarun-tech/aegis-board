import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  firstLoginSetup,
  type AuthUser,
} from "./authApi";

type FirstLoginScreenProps = {
  user: AuthUser;
  onComplete: (user: AuthUser) => void;
};

function FirstLoginScreen({
  user,
  onComplete,
}: FirstLoginScreenProps) {
  const [email, setEmail] =
    useState(user.email);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

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
        "Please enter your email.",
      );
      return;
    }

    if (!currentPassword) {
      setError(
        "Please enter your temporary password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Your new password must be at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New passwords do not match.",
      );
      return;
    }

    setLoading(true);

    try {
      const updatedUser =
        await firstLoginSetup(
          currentPassword,
          newPassword,
          cleanEmail,
        );

      onComplete(updatedUser);
    } catch (setupError) {
      setError(
        setupError instanceof Error
          ? setupError.message
          : "First-login setup failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="aegis-login">
      <section className="aegis-login-card">
        <div className="aegis-login-brand">
          <div className="aegis-login-mark">
            A
          </div>

          <div>
            <div className="aegis-login-title">
              AEGIS
            </div>

            <div className="aegis-login-subtitle">
              PRIVATE WORKSPACE
            </div>
          </div>
        </div>

        <div className="aegis-login-heading">
          Complete your setup
        </div>

        <p className="aegis-login-description">
          Welcome, {user.name}. Before you
          enter Aegis Board, set your email
          and create a new password.
        </p>

        <form
          className="aegis-login-form"
          onSubmit={handleSubmit}
        >
          <label
            className="aegis-login-label"
            htmlFor="aegis-first-email"
          >
            Email
          </label>

          <input
            id="aegis-first-email"
            className="aegis-login-input"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            autoComplete="email"
            disabled={loading}
          />

          <label
            className="aegis-login-label"
            htmlFor="aegis-current-password"
          >
            Temporary password
          </label>

          <input
            id="aegis-current-password"
            className="aegis-login-input"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value,
              )
            }
            placeholder="Enter your temporary password"
            autoComplete="current-password"
            disabled={loading}
          />

          <label
            className="aegis-login-label"
            htmlFor="aegis-new-password"
          >
            New password
          </label>

          <input
            id="aegis-new-password"
            className="aegis-login-input"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(
                event.target.value,
              )
            }
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={loading}
          />

          <label
            className="aegis-login-label"
            htmlFor="aegis-confirm-password"
          >
            Confirm new password
          </label>

          <input
            id="aegis-confirm-password"
            className="aegis-login-input"
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value,
              )
            }
            placeholder="Enter the password again"
            autoComplete="new-password"
            disabled={loading}
          />

          {error && (
            <div
              className="aegis-login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            className="aegis-login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Setting up..."
              : "Complete setup"}
          </button>
        </form>

        <div className="aegis-login-footer">
          Employee ID · {user.employee_code ?? "—"}
        </div>
      </section>
    </main>
  );
}

export default FirstLoginScreen;