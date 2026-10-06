import {
  useEffect,
  useState,
} from "react";

import {
  createEmployee,
  deleteAllEmployees,
  getEmployees,
  type Employee,
} from "../auth/authApi";

type EmployeeManagementProps = {
  onClose: () => void;
};

function EmployeeManagement({
  onClose,
}: EmployeeManagementProps) {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [employeeCode, setEmployeeCode] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [temporaryPassword, setTemporaryPassword] =
    useState("");

  const loadEmployees = async () => {
    setError("");

    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load employees.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, []);

  // ==================================================
  // CREATE EMPLOYEE
  // ==================================================

  const handleCreateEmployee = async () => {
    setError("");
    setSuccess("");

    const cleanCode =
      employeeCode.trim().toUpperCase();

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanCode) {
      setError(
        "Employee code is required.",
      );
      return;
    }

    if (!cleanName) {
      setError(
        "Employee name is required.",
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Employee email is required.",
      );
      return;
    }

    if (temporaryPassword.length < 8) {
      setError(
        "Temporary password must be at least 8 characters.",
      );
      return;
    }

    setCreating(true);

    try {
      const employee =
        await createEmployee({
          employee_code: cleanCode,
          name: cleanName,
          email: cleanEmail,
          temporary_password:
            temporaryPassword,
        });

      setEmployees((current) => [
        ...current,
        employee,
      ]);

      setEmployeeCode("");
      setName("");
      setEmail("");
      setTemporaryPassword("");

      setSuccess(
        `${employee.employee_code} created successfully.`,
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create employee.",
      );
    } finally {
      setCreating(false);
    }
  };

  // ==================================================
  // DELETE ALL EMPLOYEES
  // ==================================================

  const handleDeleteAllEmployees = async () => {
    const confirmed =
      window.confirm(
        "WARNING: This will permanently delete ALL employee accounts, their assigned work, collaboration participation records, and employee sessions.\n\nYour admin account will NOT be deleted.\n\nContinue?",
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const message =
        await deleteAllEmployees();

      setEmployees([]);

      setSuccess(message);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete employees.",
      );
    }
  };

  return (
    <div
      className="aegis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-management-title"
    >
      <div className="aegis-employee-modal">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="aegis-employee-header">
          <div>
            <div
              id="employee-management-title"
              className="aegis-employee-title"
            >
              Employee Management
            </div>

            <div className="aegis-employee-subtitle">
              Manage Aegis workspace employees
            </div>
          </div>

          <button
            type="button"
            className="aegis-employee-close"
            onClick={onClose}
            aria-label="Close employee management"
          >
            ×
          </button>
        </div>

        <div className="aegis-employee-content">

          {/* ==================================================
              EMPLOYEE LIST
          ================================================== */}

          <section className="aegis-employee-list-section">

            <div className="aegis-employee-section-title">
              Employees
            </div>

            <button
              type="button"
              className="aegis-login-button"
              onClick={
                handleDeleteAllEmployees
              }
              disabled={
                loading ||
                creating ||
                employees.length === 0
              }
            >
              Delete All Employees
            </button>

            {loading ? (
              <div className="aegis-employee-empty">
                Loading employees...
              </div>
            ) : employees.length === 0 ? (
              <div className="aegis-employee-empty">
                No employees created yet.
              </div>
            ) : (
              <div className="aegis-employee-list">
                {employees.map(
                  (employee) => (
                    <div
                      key={employee.id}
                      className="aegis-employee-row"
                    >
                      <div className="aegis-employee-code">
                        {employee.employee_code}
                      </div>

                      <div className="aegis-employee-info">
                        <div className="aegis-employee-name">
                          {employee.name}
                        </div>

                        <div className="aegis-employee-email">
                          {employee.email}
                        </div>
                      </div>

                      <div
                        className={
                          employee.is_active
                            ? "aegis-employee-status active"
                            : "aegis-employee-status"
                        }
                      >
                        {employee.is_active
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* ==================================================
              CREATE EMPLOYEE
          ================================================== */}

          <section className="aegis-employee-create-section">

            <div className="aegis-employee-section-title">
              Add Employee
            </div>

            <div className="aegis-employee-form">

              <label>
                Employee ID

                <input
                  type="text"
                  value={employeeCode}
                  onChange={(event) =>
                    setEmployeeCode(
                      event.target.value,
                    )
                  }
                  placeholder="AG3"
                  disabled={creating}
                />
              </label>

              <label>
                Name

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Employee name"
                  disabled={creating}
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="employee@example.com"
                  disabled={creating}
                />
              </label>

              <label>
                Temporary Password

                <input
                  type="password"
                  value={temporaryPassword}
                  onChange={(event) =>
                    setTemporaryPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Minimum 8 characters"
                  disabled={creating}
                />
              </label>

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
                onClick={
                  handleCreateEmployee
                }
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Employee"}
              </button>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default EmployeeManagement;