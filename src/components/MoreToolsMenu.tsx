import Icon from "./Icon";

type MoreToolsMenuProps = {
  open: boolean;

  onClose: () => void;
};

function MoreToolsMenu({
  open,
  onClose,
}: MoreToolsMenuProps) {
  if (!open) {
    return null;
  }

  const items = [
    [
      "note",
      "Insert image",
      "9",
    ],
    [
      "rectangle",
      "Frame tool",
      "F",
    ],
    [
      "diamond",
      "Web Embed",
      "",
    ],
    [
      "ellipse",
      "Draw to shape",
      "Shift+X",
    ],
    [
      "pen",
      "Laser pointer",
      "K",
    ],
    [
      "bucket",
      "Bucket fill",
      "B",
    ],
    [
      "select",
      "Lasso selection",
      "",
    ],
  ] as const;

  return (
    <div className="more-tools-menu">
      {items.map(
        ([
          icon,
          label,
          shortcut,
        ]) => (
          <button
            key={label}
            type="button"
            className="more-tool-item"
            onClick={onClose}
          >
            <span className="more-tool-icon">
              {icon ===
              "bucket" ? (
                "◈"
              ) : (
                <Icon
                  name={icon}
                  size={18}
                />
              )}
            </span>

            <span>
              {label}
            </span>

            <kbd>
              {shortcut}
            </kbd>
          </button>
        ),
      )}

      <div className="more-menu-separator" />

      <div className="generate-title">
        Generate
      </div>

      <button
        type="button"
        className="more-tool-item"
        onClick={onClose}
      >
        <span className="more-tool-icon">
          ✣
        </span>

        <span>
          Text to diagram
        </span>

        <span className="ai-badge">
          AI
        </span>
      </button>

      <button
        type="button"
        className="more-tool-item"
        onClick={onClose}
      >
        <span className="more-tool-icon">
          ✦
        </span>

        <span>
          Mermaid to Excalidraw
        </span>
      </button>

      <button
        type="button"
        className="more-tool-item"
        onClick={onClose}
      >
        <span className="more-tool-icon">
          ✧
        </span>

        <span>
          Wireframe to code
        </span>

        <span className="ai-badge">
          AI
        </span>
      </button>
    </div>
  );
}

export default MoreToolsMenu;