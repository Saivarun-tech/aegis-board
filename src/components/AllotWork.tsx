import {
  useEffect,
  useState,
} from "react";

import {
  createWork,
  getEmployees,
  type Employee,
} from "../auth/authApi";

type AllotWorkProps = {
  onClose: () => void;
};

function AllotWork({
  onClose,
}: AllotWorkProps) {
  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [employeeId, setEmployeeId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      setError("");

      try {
        const data =
          await getEmployees();

        setEmployees(data);

        const firstActiveEmployee =
          data.find(
            (employee) =>
              employee.is_active,
          );

        if (firstActiveEmployee) {
          setEmployeeId(
            firstActiveEmployee.id,
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load employees.",
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    void loadEmployees();
  }, []);

  const handleCreateWork = async () => {
    setError("");
    setSuccess("");

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    if (!employeeId) {
      setError(
        "Please select an employee.",
      );
      return;
    }

    if (!cleanTitle) {
      setError(
        "Work title is required.",
      );
      return;
    }

    setCreating(true);

    try {
      await createWork({
        employee_id: employeeId,
        title: cleanTitle,
        description: cleanDescription,
      });

      setTitle("");
      setDescription("");

      setSuccess(
        "Work assigned successfully.",
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to assign work.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="aegis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allot-work-title"
    >
      <div className="aegis-employee-modal">
        <div className="aegis-employee-header">
          <div>
            <div
              id="allot-work-title"
              className="aegis-employee-title"
            >
              Allot Work
            </div>

            <div className="aegis-employee-subtitle">
              Assign work to an Aegis employee
            </div>
          </div>

          <button
            type="button"
            className="aegis-employee-close"
            onClick={onClose}
            aria-label="Close allot work"
          >
            ×
          </button>
        </div>

        <div className="aegis-employee-content">
          <section className="aegis-employee-create-section">
            <div className="aegis-employee-section-title">
              New Work
            </div>

            <div className="aegis-employee-form">
              <label>
                Employee

                <select
                  value={employeeId}
                  onChange={(event) =>
                    setEmployeeId(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingEmployees ||
                    creating
                  }
                >
                  <option value="">
                    {loadingEmployees
                      ? "Loading employees..."
                      : "Select employee"}
                  </option>

                  {employees
                    .filter(
                      (employee) =>
                        employee.is_active,
                    )
                    .map(
                      (employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.employee_code ??
                            "—"}{" "}
                          ·{" "}
                          {employee.name}
                        </option>
                      ),
                    )}
                </select>
              </label>

              <label>
                Work Title

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Enter work title"
                  disabled={creating}
                />
              </label>

              <label>
                Description

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe the work..."
                  rows={6}
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
                  handleCreateWork
                }
                disabled={
                  creating ||
                  loadingEmployees
                }
              >
                {creating
                  ? "Assigning..."
                  : "Assign Work"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AllotWork;