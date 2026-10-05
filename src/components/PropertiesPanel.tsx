import { useState } from "react";

import type {
  AegisElement,
  TextAlign,
  TextElement,
} from "../canvas/types";

type PropertiesPanelProps = {
  element?: AegisElement;

  onChange?: (
    changes: Partial<AegisElement>,
  ) => void;

  onDelete?: () => void;

  tool?: "draw";

  penStroke?: string;

  setPenStroke?: (
    value: string,
  ) => void;

  penStrokeWidth?: number;

  setPenStrokeWidth?: (
    value: number,
  ) => void;

  penOpacity?: number;

  setPenOpacity?: (
    value: number,
  ) => void;
};

const colors = [
  "#111111",
  "#ff6b6b",
  "#34a853",
  "#4f9de8",
  "#c77700",
  "#ffffff",
];

/*
 * The first four fonts are shown directly.
 * The remaining fonts are available through
 * "More fonts".
 *
 * These use fonts normally available on
 * Windows / browsers. We are not bundling
 * another project's font files.
 */
const fonts = [
  {
    value: "Inter",
    label: "Inter",
  },
  {
    value: "Arial",
    label: "Arial",
  },
  {
    value: "Courier New",
    label: "Courier",
  },
  {
    value: "Georgia",
    label: "Georgia",
  },
];

const moreFonts = [
  {
    value: "Helvetica",
    label: "Helvetica",
  },
  {
    value: "Verdana",
    label: "Verdana",
  },
  {
    value: "Trebuchet MS",
    label: "Trebuchet",
  },
  {
    value: "Times New Roman",
    label: "Times",
  },
  {
    value: "Consolas",
    label: "Consolas",
  },
  {
    value: "Monaco",
    label: "Monaco",
  },
  {
    value: "Lucida Console",
    label: "Lucida Console",
  },
  {
    value: "Comic Sans MS",
    label: "Comic Sans",
  },
  {
    value: "Impact",
    label: "Impact",
  },
  {
    value: "Tahoma",
    label: "Tahoma",
  },
  {
    value: "Calibri",
    label: "Calibri",
  },
  {
    value: "Cambria",
    label: "Cambria",
  },
  {
    value: "Garamond",
    label: "Garamond",
  },
  {
    value: "Palatino Linotype",
    label: "Palatino",
  },
  {
    value: "Book Antiqua",
    label: "Book Antiqua",
  },
  {
    value: "Franklin Gothic Medium",
    label: "Franklin Gothic",
  },
  {
    value: "Century Gothic",
    label: "Century Gothic",
  },
  {
    value: "Segoe UI",
    label: "Segoe UI",
  },
  {
    value: "Arial Black",
    label: "Arial Black",
  },
  {
    value: "Brush Script MT",
    label: "Brush Script",
  },
  {
    value: "Lucida Handwriting",
    label: "Handwriting",
  },
  {
    value: "Copperplate",
    label: "Copperplate",
  },
];

const textSizes = [
  {
    label: "S",
    value: 16,
  },
  {
    label: "M",
    value: 24,
  },
  {
    label: "L",
    value: 32,
  },
  {
    label: "XL",
    value: 48,
  },
];

function FontButton({
  value,
  label,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  selected: boolean;
  onSelect: (
    value: string,
  ) => void;
}) {
  return (
    <button
      type="button"
      className={
        selected
          ? "font-choice active"
          : "font-choice"
      }
      style={{
        fontFamily: `"${value}", sans-serif`,
      }}
      onClick={() =>
        onSelect(value)
      }
    >
      {label}
    </button>
  );
}

export default function PropertiesPanel({
  element,
  onChange,
  onDelete,

  tool,

  penStroke,
  setPenStroke,

  penStrokeWidth,
  setPenStrokeWidth,

  penOpacity,
  setPenOpacity,
}: PropertiesPanelProps) {
  const [moreFontsOpen, setMoreFontsOpen] =
    useState(false);

  /*
   * ==================================================
   * PEN TOOL PROPERTIES
   * ==================================================
   */

  if (
    tool === "draw" &&
    !element
  ) {
    return (
      <aside className="properties-panel">
        <section className="property-section">
          <div className="property-title">
            Stroke
          </div>

          <div className="color-row">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={
                  penStroke === color
                    ? "stroke-swatch selected"
                    : "stroke-swatch"
                }
                style={{
                  background: color,
                }}
                onClick={() =>
                  setPenStroke?.(
                    color,
                  )
                }
                title={color}
              />
            ))}

            <input
              type="color"
              className="custom-color"
              value={
                penStroke ??
                "#111111"
              }
              onChange={(event) =>
                setPenStroke?.(
                  event.target.value,
                )
              }
            />
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Background
          </div>

          <div
            className="color-row disabled-property"
            title="Pen does not have a closed background"
          >
            <button
              type="button"
              className="stroke-swatch selected"
              disabled
            >
              ×
            </button>

            {colors
              .slice(0, 5)
              .map((color) => (
                <button
                  key={color}
                  type="button"
                  className="stroke-swatch"
                  style={{
                    background:
                      color,
                  }}
                  disabled
                />
              ))}
          </div>

          <div className="property-hint">
            Background is available
            for closed shapes.
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Fill
          </div>

          <div className="fill-grid">
            <button
              type="button"
              className="fill-choice disabled"
              disabled
            >
              ▨
            </button>

            <button
              type="button"
              className="fill-choice disabled"
              disabled
            >
              ▦
            </button>

            <button
              type="button"
              className="fill-choice disabled"
              disabled
            >
              ■
            </button>
          </div>

          <div className="property-hint">
            Fill is available for
            closed shapes.
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Stroke width
          </div>

          <div className="size-grid">
            {[
              {
                label: "S",
                value: 1,
              },
              {
                label: "M",
                value: 3,
              },
              {
                label: "L",
                value: 6,
              },
              {
                label: "XL",
                value: 10,
              },
            ].map((size) => (
              <button
                key={size.value}
                type="button"
                className={
                  penStrokeWidth ===
                  size.value
                    ? "size-choice active"
                    : "size-choice"
                }
                onClick={() =>
                  setPenStrokeWidth?.(
                    size.value,
                  )
                }
              >
                {size.label}
              </button>
            ))}
          </div>

          <input
            className="size-range"
            type="range"
            min="1"
            max="30"
            value={
              penStrokeWidth ?? 3
            }
            onChange={(event) =>
              setPenStrokeWidth?.(
                Number(
                  event.target.value,
                ),
              )
            }
          />

          <div className="size-value">
            {penStrokeWidth ?? 3}px
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Opacity
          </div>

          <input
            className="opacity-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              penOpacity ?? 1
            }
            onChange={(event) =>
              setPenOpacity?.(
                Number(
                  event.target.value,
                ),
              )
            }
          />

          <div className="opacity-values">
            <span>0</span>

            <span>
              {Math.round(
                (penOpacity ?? 1) *
                  100,
              )}
              %
            </span>

            <span>100</span>
          </div>
        </section>
      </aside>
    );
  }

  /*
   * ==================================================
   * TEXT PROPERTIES
   * ==================================================
   */

  if (
    element?.type === "text"
  ) {
    const textElement =
      element as TextElement;

    const selectFont = (
      fontFamily: string,
    ) => {
      onChange?.({
        fontFamily,
      });

      /*
       * Automatically close the
       * More Fonts menu after
       * selecting a font.
       */
      setMoreFontsOpen(false);
    };

    return (
      <aside className="properties-panel">
        <section className="property-section">
          <div className="property-title">
            Text color
          </div>

          <div className="color-row">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={
                  textElement.color ===
                  color
                    ? "stroke-swatch selected"
                    : "stroke-swatch"
                }
                style={{
                  background: color,
                }}
                onClick={() =>
                  onChange?.({
                    color,
                  })
                }
              />
            ))}

            <input
              type="color"
              className="custom-color"
              value={
                textElement.color
              }
              onChange={(event) =>
                onChange?.({
                  color:
                    event.target
                      .value,
                })
              }
            />
          </div>
        </section>

        {/* ==========================================
            FONT FAMILY
            ========================================== */}

        <section className="property-section">
          <div className="property-title">
            Font family
          </div>

          <div className="font-family-grid">
            {fonts.map((font) => (
              <FontButton
                key={font.value}
                value={font.value}
                label={font.label}
                selected={
                  textElement.fontFamily ===
                  font.value
                }
                onSelect={selectFont}
              />
            ))}
          </div>

          <button
            type="button"
            className={
              moreFontsOpen
                ? "more-fonts-button active"
                : "more-fonts-button"
            }
            onClick={() =>
              setMoreFontsOpen(
                (value) =>
                  !value,
              )
            }
          >
            <span>
              {moreFontsOpen
                ? "Close fonts"
                : "More fonts"}
            </span>

            <span
              className="more-fonts-arrow"
            >
              {moreFontsOpen
                ? "↑"
                : "→"}
            </span>
          </button>

          {moreFontsOpen && (
            <div className="more-fonts-menu">
              <div className="more-fonts-header">
                <span>
                  More fonts
                </span>

                <button
                  type="button"
                  className="more-fonts-close"
                  onClick={() =>
                    setMoreFontsOpen(
                      false,
                    )
                  }
                  aria-label="Close font menu"
                >
                  ×
                </button>
              </div>

              <div className="more-fonts-scroll">
                {moreFonts.map(
                  (font) => (
                    <FontButton
                      key={
                        font.value
                      }
                      value={
                        font.value
                      }
                      label={
                        font.label
                      }
                      selected={
                        textElement.fontFamily ===
                        font.value
                      }
                      onSelect={
                        selectFont
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </section>

        {/* ==========================================
            FONT SIZE
            ========================================== */}

        <section className="property-section">
          <div className="property-title">
            Font size
          </div>

          <div className="size-grid">
            {textSizes.map(
              (size) => (
                <button
                  key={
                    size.value
                  }
                  type="button"
                  className={
                    textElement.fontSize ===
                    size.value
                      ? "size-choice active"
                      : "size-choice"
                  }
                  onClick={() =>
                    onChange?.({
                      fontSize:
                        size.value,
                    })
                  }
                >
                  {size.label}
                </button>
              ),
            )}
          </div>

          <input
            className="size-range"
            type="range"
            min="8"
            max="120"
            value={
              textElement.fontSize
            }
            onChange={(event) =>
              onChange?.({
                fontSize: Number(
                  event.target
                    .value,
                ),
              })
            }
          />

          <div className="size-value">
            {textElement.fontSize}px
          </div>
        </section>

        {/* ==========================================
            TEXT ALIGN
            ========================================== */}

        <section className="property-section">
          <div className="property-title">
            Text align
          </div>

          <div className="align-grid">
            {(
              [
                "left",
                "center",
                "right",
              ] as TextAlign[]
            ).map((align) => (
              <button
                key={align}
                type="button"
                className={
                  textElement.textAlign ===
                  align
                    ? "align-choice active"
                    : "align-choice"
                }
                onClick={() =>
                  onChange?.({
                    textAlign:
                      align,
                  })
                }
              >
                {align === "left"
                  ? "≡"
                  : align ===
                      "center"
                    ? "≡"
                    : "≡"}
              </button>
            ))}
          </div>
        </section>

        {/* ==========================================
            OPACITY
            ========================================== */}

        <section className="property-section">
          <div className="property-title">
            Opacity
          </div>

          <input
            className="opacity-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              textElement.opacity
            }
            onChange={(event) =>
              onChange?.({
                opacity: Number(
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
                textElement.opacity *
                  100,
              )}
              %
            </span>

            <span>100</span>
          </div>
        </section>

        {/* ==========================================
            STYLE
            ========================================== */}

        <section className="property-section">
          <div className="property-title">
            Style
          </div>

          <button
            type="button"
            className={
              textElement.fontWeight >=
              700
                ? "bold-control active"
                : "bold-control"
            }
            onClick={() =>
              onChange?.({
                fontWeight:
                  textElement.fontWeight >=
                  700
                    ? 400
                    : 700,
              })
            }
          >
            <strong>B</strong>

            <span>
              Bold
            </span>
          </button>
        </section>

        <button
          type="button"
          className="delete-element-button"
          onClick={onDelete}
        >
          Delete text
        </button>
      </aside>
    );
  }

  /*
   * ==================================================
   * FREEHAND OBJECT PROPERTIES
   * ==================================================
   */

  if (
    element?.type ===
    "freehand"
  ) {
    return (
      <aside className="properties-panel">
        <section className="property-section">
          <div className="property-title">
            Stroke
          </div>

          <div className="color-row">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={
                  element.stroke ===
                  color
                    ? "stroke-swatch selected"
                    : "stroke-swatch"
                }
                style={{
                  background: color,
                }}
                onClick={() =>
                  onChange?.({
                    stroke: color,
                  })
                }
              />
            ))}

            <input
              type="color"
              className="custom-color"
              value={
                element.stroke
              }
              onChange={(event) =>
                onChange?.({
                  stroke:
                    event.target
                      .value,
                })
              }
            />
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Background
          </div>

          <div className="property-hint">
            Pen strokes do not
            have a closed
            background.
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Fill
          </div>

          <div className="property-hint">
            Fill is available
            for closed shapes.
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Stroke width
          </div>

          <input
            className="size-range"
            type="range"
            min="1"
            max="30"
            value={
              element.strokeWidth
            }
            onChange={(event) =>
              onChange?.({
                strokeWidth:
                  Number(
                    event.target
                      .value,
                  ),
              })
            }
          />

          <div className="size-value">
            {element.strokeWidth}px
          </div>
        </section>

        <section className="property-section">
          <div className="property-title">
            Opacity
          </div>

          <input
            className="opacity-range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={
              element.opacity
            }
            onChange={(event) =>
              onChange?.({
                opacity: Number(
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
                element.opacity *
                  100,
              )}
              %
            </span>

            <span>100</span>
          </div>
        </section>

        <button
          type="button"
          className="delete-element-button"
          onClick={onDelete}
        >
          Delete drawing
        </button>
      </aside>
    );
  }

  return null;
}