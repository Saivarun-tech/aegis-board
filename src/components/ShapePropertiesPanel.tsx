import type {
  FillStyle,
  ShapeElement,
  StrokeStyle,
} from "../canvas/types";

type ShapePropertiesPanelProps = {
  shape: ShapeElement;

  onChange: (
    changes: Partial<ShapeElement>,
  ) => void;

  onDelete: () => void;
};

const COLORS = [
  "#111111",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const BACKGROUNDS = [
  "transparent",
  "#ffffff",
  "#fee2e2",
  "#dcfce7",
  "#dbeafe",
  "#fef3c7",
  "#ede9fe",
];

const FILLS: FillStyle[] = [
  "none",
  "solid",
  "hachure",
  "cross-hatch",
];

const STROKES: StrokeStyle[] = [
  "solid",
  "dashed",
  "dotted",
];

export default function ShapePropertiesPanel({
  shape,
  onChange,
  onDelete,
}: ShapePropertiesPanelProps) {
  const isLine =
    shape.shapeType === "line" ||
    shape.shapeType === "arrow";

  return (
    <aside className="properties-panel shape-properties-panel">

      {/* STROKE */}

      <section className="property-section">
        <div className="property-title">
          Stroke
        </div>

        <div className="color-row">
          {COLORS.map(
            (color) => (
              <button
                key={color}
                type="button"
                className={
                  shape.stroke ===
                  color
                    ? "color-swatch selected"
                    : "color-swatch"
                }
                style={{
                  backgroundColor:
                    color,
                }}
                onClick={() =>
                  onChange({
                    stroke:
                      color,
                  })
                }
              />
            ),
          )}

          <label className="custom-color">
            <input
              type="color"
              value={
                shape.stroke
              }
              onChange={(
                event,
              ) =>
                onChange({
                  stroke:
                    event.target
                      .value,
                })
              }
            />
          </label>
        </div>
      </section>

      {/* BACKGROUND */}

      {!isLine && (
        <section className="property-section">
          <div className="property-title">
            Background
          </div>

          <div className="color-row">
            {BACKGROUNDS.map(
              (color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    shape.background ===
                    color
                      ? "color-swatch selected"
                      : "color-swatch"
                  }
                  style={{
                    backgroundColor:
                      color ===
                      "transparent"
                        ? "#ffffff"
                        : color,
                  }}
                  onClick={() =>
                    onChange({
                      background:
                        color,
                    })
                  }
                >
                  {color ===
                    "transparent" &&
                    "×"}
                </button>
              ),
            )}
          </div>
        </section>
      )}

      {/* FILL */}

      {!isLine && (
        <section className="property-section">
          <div className="property-title">
            Fill
          </div>

          <div className="property-button-grid fill-grid">
            {FILLS.map(
              (fill) => (
                <button
                  key={fill}
                  type="button"
                  className={
                    shape.fillStyle ===
                    fill
                      ? "property-choice selected"
                      : "property-choice"
                  }
                  onClick={() =>
                    onChange({
                      fillStyle:
                        fill,
                    })
                  }
                >
                  {fill ===
                  "none"
                    ? "None"
                    : fill ===
                        "solid"
                      ? "Solid"
                      : fill ===
                          "hachure"
                        ? "Hachure"
                        : "Cross"}
                </button>
              ),
            )}
          </div>
        </section>
      )}

      {/* STROKE WIDTH */}

      <section className="property-section">
        <div className="property-title">
          Stroke width
        </div>

        <div className="property-button-grid">
          {[1, 2, 4, 6].map(
            (width) => (
              <button
                key={width}
                type="button"
                className={
                  shape.strokeWidth ===
                  width
                    ? "property-choice selected"
                    : "property-choice"
                }
                onClick={() =>
                  onChange({
                    strokeWidth:
                      width,
                  })
                }
              >
                {width}px
              </button>
            ),
          )}
        </div>
      </section>

      {/* STROKE STYLE */}

      <section className="property-section">
        <div className="property-title">
          Stroke style
        </div>

        <div className="property-button-grid">
          {STROKES.map(
            (style) => (
              <button
                key={style}
                type="button"
                className={
                  shape.strokeStyle ===
                  style
                    ? "property-choice selected"
                    : "property-choice"
                }
                onClick={() =>
                  onChange({
                    strokeStyle:
                      style,
                  })
                }
              >
                {style}
              </button>
            ),
          )}
        </div>
      </section>

      {/* OPACITY */}

      <section className="property-section">
        <div className="property-title">
          Opacity
        </div>

        <input
          className="property-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={
            shape.opacity
          }
          onChange={(
            event,
          ) =>
            onChange({
              opacity:
                Number(
                  event.target
                    .value,
                ),
            })
          }
        />

        <div className="opacity-values">
          <span>0</span>

          <span>
            {Math.round(
              shape.opacity *
                100,
            )}
            %
          </span>

          <span>100</span>
        </div>
      </section>

      {/* NOTE TEXT */}

      {shape.shapeType ===
        "note" && (
        <section className="property-section">
          <div className="property-title">
            Note text
          </div>

          <input
            className="property-text-input"
            value={
              shape.noteText ??
              ""
            }
            onChange={(
              event,
            ) =>
              onChange({
                noteText:
                  event.target
                    .value,
              })
            }
            placeholder="Note"
          />
        </section>
      )}

      {/* DELETE */}

      <section className="property-section danger-section">
        <button
          type="button"
          className="delete-property-button"
          onClick={onDelete}
        >
          Delete
        </button>
      </section>

    </aside>
  );
}