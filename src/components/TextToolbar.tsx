import type {
  TextAlign,
} from "../canvas/types";

type TextToolbarProps = {
  fontSize: number;

  setFontSize: (
    value: number,
  ) => void;

  fontFamily: string;

  setFontFamily: (
    value: string,
  ) => void;

  fontWeight: number;

  setFontWeight: (
    value: number,
  ) => void;

  textColor: string;

  setTextColor: (
    value: string,
  ) => void;

  textAlign: TextAlign;

  setTextAlign: (
    value: TextAlign,
  ) => void;
};

function TextToolbar({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  fontWeight,
  setFontWeight,
  textColor,
  setTextColor,
  textAlign,
  setTextAlign,
}: TextToolbarProps) {
  return (
    <div className="text-toolbar">
      <select
        className="toolbar-select"
        value={fontFamily}
        onChange={(event) =>
          setFontFamily(
            event.target.value,
          )
        }
        title="Font family"
      >
        <option value="Inter">
          Inter
        </option>

        <option value="Arial">
          Arial
        </option>

        <option value="Georgia">
          Georgia
        </option>

        <option value="Times New Roman">
          Times New Roman
        </option>

        <option value="Courier New">
          Courier New
        </option>
      </select>

      <input
        className="font-size-input"
        type="number"
        min="8"
        max="200"
        value={fontSize}
        title="Font size"
        onChange={(event) => {
          const value =
            Number(
              event.target.value,
            );

          if (
            Number.isFinite(
              value,
            )
          ) {
            setFontSize(
              Math.min(
                200,
                Math.max(
                  8,
                  value,
                ),
              ),
            );
          }
        }}
      />

      <button
        type="button"
        className={
          fontWeight >= 700
            ? "property-button active"
            : "property-button"
        }
        onClick={() =>
          setFontWeight(
            fontWeight >= 700
              ? 400
              : 700,
          )
        }
        title="Bold"
      >
        <strong>B</strong>
      </button>

      <input
        className="color-input"
        type="color"
        value={textColor}
        title="Text color"
        onChange={(event) =>
          setTextColor(
            event.target.value,
          )
        }
      />

      <button
        type="button"
        className={
          textAlign === "left"
            ? "property-button active"
            : "property-button"
        }
        onClick={() =>
          setTextAlign("left")
        }
        title="Align left"
      >
        L
      </button>

      <button
        type="button"
        className={
          textAlign === "center"
            ? "property-button active"
            : "property-button"
        }
        onClick={() =>
          setTextAlign("center")
        }
        title="Align center"
      >
        C
      </button>

      <button
        type="button"
        className={
          textAlign === "right"
            ? "property-button active"
            : "property-button"
        }
        onClick={() =>
          setTextAlign("right")
        }
        title="Align right"
      >
        R
      </button>
    </div>
  );
}

export default TextToolbar;