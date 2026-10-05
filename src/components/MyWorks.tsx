import {
  useEffect,
  useState,
} from "react";

import {
  getMyWorks,
  type Work,
} from "../auth/authApi";

type MyWorksProps = {
  onClose: () => void;
};

function MyWorks({
  onClose,
}: MyWorksProps) {
  const [works, setWorks] =
    useState<Work[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadWorks = async () => {
      setError("");

      try {
        const data =
          await getMyWorks();

        setWorks(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load your works.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadWorks();
  }, []);

  return (
    <div
      className="aegis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-works-title"
    >
      <div className="aegis-employee-modal">
        <div className="aegis-employee-header">
          <div>
            <div
              id="my-works-title"
              className="aegis-employee-title"
            >
              My Works
            </div>

            <div className="aegis-employee-subtitle">
              Work assigned to you
            </div>
          </div>

          <button
            type="button"
            className="aegis-employee-close"
            onClick={onClose}
            aria-label="Close my works"
          >
            ×
          </button>
        </div>

        <div className="aegis-employee-content">
          <section className="aegis-employee-list-section">
            <div className="aegis-employee-section-title">
              Assigned Work
            </div>

            {loading ? (
              <div className="aegis-employee-empty">
                Loading your works...
              </div>
            ) : error ? (
              <div
                className="aegis-login-error"
                role="alert"
              >
                {error}
              </div>
            ) : works.length === 0 ? (
              <div className="aegis-employee-empty">
                No work has been assigned to you yet.
              </div>
            ) : (
              <div className="aegis-employee-list">
                {works.map((work) => (
                  <article
                    key={work.id}
                    className="aegis-employee-row"
                  >
                    <div className="aegis-employee-info">
                      <div className="aegis-employee-name">
                        {work.title}
                      </div>

                      <div className="aegis-employee-email">
                        {work.description ||
                          "No description provided."}
                      </div>
                    </div>

                    <div className="aegis-employee-status active">
                      {work.status}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default MyWorks;
