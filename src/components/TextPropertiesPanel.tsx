import { useState } from "react";

import type {
  TextAlign,
  TextElement,
} from "../canvas/types";

type TextPropertiesPanelProps = {
  text: TextElement;
  onChange: (
    changes: Partial<TextElement>,
  ) => void;
  onDelete?: () => void;
};

const COLORS = [
  "#111111",
  "#ffffff",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
];

const PRIMARY_FONTS = [
  {
    label: "Inter",
    value: "Inter",
  },
  {
    label: "Sans",
    value: "Arial",
  },
  {
    label: "Mono",
    value: "monospace",
  },
  {
    label: "Serif",
    value: "Georgia",
  },
];

const MORE_FONTS = [
  {
    label: "Helvetica",
    value: "Helvetica",
  },
  {
    label: "Verdana",
    value: "Verdana",
  },
  {
    label: "Trebuchet",
    value: "Trebuchet MS",
  },
  {
    label: "Times",
    value: "Times New Roman",
  },
  {
    label: "Courier New",
    value: "Courier New",
  },
  {
    label: "Consolas",
    value: "Consolas",
  },
  {
    label: "Monaco",
    value: "Monaco",
  },
  {
    label: "Lucida",
    value: "Lucida Console",
  },
  {
    label: "Comic Sans",
    value: "Comic Sans MS",
  },
  {
    label: "Impact",
    value: "Impact",
  },
  {
    label: "Tahoma",
    value: "Tahoma",
  },
  {
    label: "Calibri",
    value: "Calibri",
  },
  {
    label: "Cambria",
    value: "Cambria",
  },
  {
    label: "Garamond",
    value: "Garamond",
  },
  {
    label: "Palatino",
    value: "Palatino Linotype",
  },
  {
    label: "Century Gothic",
    value: "Century Gothic",
  },
  {
    label: "Segoe UI",
    value: "Segoe UI",
  },
  {
    label: "Arial Black",
    value: "Arial Black",
  },
  {
    label: "Brush Script",
    value: "Brush Script MT",
  },
  {
    label: "Lucida Handwriting",
    value: "Lucida Handwriting",
  },
];

const SIZES = [
  {
    label: "S",
    value: 20,
  },
  {
    label: "M",
    value: 28,
  },
  {
    label: "L",
    value: 36,
  },
  {
    label: "XL",
    value: 48,
  },
];

export default function TextPropertiesPanel({
  text,
  onChange,
  onDelete,
}: TextPropertiesPanelProps) {
  const [moreFontsOpen, setMoreFontsOpen] =
    useState(false);

  const selectFont = (
    fontFamily: string,
  ) => {
    onChange({
      fontFamily,
    });

    // Selecting a font immediately
    // closes the font explorer.
    setMoreFontsOpen(false);
  };

  return (
    <aside className="properties-panel text-properties-panel">
      {/* ==================================================
          TEXT COLOR
          ================================================== */}

      <section className="property-section">
        <div className="property-title">
          Text color
        </div>

        <div className="color-row">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={
                text.color === color
                  ? "color-swatch selected"
                  : "color-swatch"
              }
              style={{
                backgroundColor: color,
              }}
              onClick={() =>
                onChange({ color })
              }
              aria-label={`Text color ${color}`}
            />
          ))}

          <label className="custom-color">
            <input
              type="color"
              value={text.color}
              onChange={(event) =>
                onChange({
                  color:
                    event.target.value,
                })
              }
            />
          </label>
        </div>
      </section>

      {/* ==================================================
          FONT FAMILY
          ================================================== */}

      <section className="property-section">
        <div className="property-title">
          Font family
        </div>

        <div className="font-explorer-grid">
          {PRIMARY_FONTS.map(
            (font) => (
              <button
                key={font.value}
                type="button"
                className={
                  text.fontFamily ===
                  font.value
                    ? "font-explorer-choice selected"
                    : "font-explorer-choice"
                }
                style={{
                  fontFamily:
                    font.value,
                }}
                onClick={() =>
                  selectFont(
                    font.value,
                  )
                }
              >
                {font.label}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className={
            moreFontsOpen
              ? "font-more-trigger open"
              : "font-more-trigger"
          }
          onClick={() =>
            setMoreFontsOpen(
              (open) => !open,
            )
          }
        >
          <span>
            More fonts
          </span>

          <span className="font-more-trigger-icon">
            {moreFontsOpen
              ? "⌃"
              : "›"}
          </span>
        </button>

        {moreFontsOpen && (
          <div className="font-explorer-menu">
            <div className="font-explorer-header">
              <span>
                Explore fonts
              </span>

              <button
                type="button"
                className="font-explorer-close"
                onClick={() =>
                  setMoreFontsOpen(
                    false,
                  )
                }
                aria-label="Close font explorer"
              >
                ×
              </button>
            </div>

            <div className="font-explorer-list">
              {MORE_FONTS.map(
                (font) => (
                  <button
                    key={font.value}
                    type="button"
                    className={
                      text.fontFamily ===
                      font.value
                        ? "font-explorer-item selected"
                        : "font-explorer-item"
                    }
                    style={{
                      fontFamily:
                        font.value,
                    }}
                    onClick={() =>
                      selectFont(
                        font.value,
                      )
                    }
                  >
                    <span>
                      {font.label}
                    </span>

                    {text.fontFamily ===
                      font.value && (
                      <span className="font-check">
                        ✓
                      </span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          FONT SIZE
          ================================================== */}

      <section className="property-section">
        <div className="property-title">
          Font size
        </div>

        <div className="property-button-grid size-grid">
          {SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              className={
                text.fontSize ===
                size.value
                  ? "property-choice selected"
                  : "property-choice"
              }
              onClick={() =>
                onChange({
                  fontSize:
                    size.value,
                })
              }
            >
              {size.label}
            </button>
          ))}
        </div>

        <input
          className="property-slider"
          type="range"
          min="8"
          max="96"
          step="1"
          value={text.fontSize}
          onChange={(event) =>
            onChange({
              fontSize: Number(
                event.target.value,
              ),
            })
          }
        />

        <div className="opacity-values">
          <span>8</span>

          <span>
            {text.fontSize}px
          </span>

          <span>96</span>
        </div>
      </section>

      {/* ==================================================
          TEXT ALIGN
          ================================================== */}

      <section className="property-section">
        <div className="property-title">
          Text align
        </div>

        <div className="property-button-grid align-grid">
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
                text.textAlign ===
                align
                  ? "property-choice selected"
                  : "property-choice"
              }
              onClick={() =>
                onChange({
                  textAlign: align,
                })
              }
              aria-label={`${align} alignment`}
            >
              {align === "left"
                ? "≡"
                : align === "center"
                  ? "☰"
                  : "≡"}
            </button>
          ))}
        </div>
      </section>

      {/* ==================================================
          OPACITY
          ================================================== */}

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
          value={text.opacity}
          onChange={(event) =>
            onChange({
              opacity: Number(
                event.target.value,
              ),
            })
          }
        />

        <div className="opacity-values">
          <span>0</span>

          <span>
            {Math.round(
              text.opacity * 100,
            )}
            %
          </span>

          <span>100</span>
        </div>
      </section>

      {/* ==================================================
          STYLE
          ================================================== */}

      <section className="property-section">
        <div className="property-title">
          Style
        </div>

        <button
          type="button"
          className={
            text.fontWeight >= 700
              ? "property-choice style-button selected"
              : "property-choice style-button"
          }
          onClick={() =>
            onChange({
              fontWeight:
                text.fontWeight >= 700
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

      {onDelete && (
        <section className="property-section danger-section">
          <button
            type="button"
            className="delete-property-button"
            onClick={onDelete}
          >
            Delete text
          </button>
        </section>
      )}
    </aside>
  );
}