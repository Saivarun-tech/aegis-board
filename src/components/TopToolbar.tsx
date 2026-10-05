import type { ComponentProps } from "react";

import Icon from "./Icon";

import type {
  Tool,
} from "../canvas/types";

type TopToolbarProps = {
  tool: Tool;
  locked: boolean;
  penPressureEnabled: boolean;
  onLockToggle: () => void;
  onToolChange: (tool: Tool) => void;
  onPenPressureToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onMore: () => void;
};

type ToolButtonProps = {
  icon: ComponentProps<typeof Icon>["name"];
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function ToolButton({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      className={active ? "top-tool active" : "top-tool"}
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon name={icon} size={19} />
    </button>
  );
}

function PressureButton({
  enabled,
  disabled,
  onClick,
}: {
  enabled: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        enabled
          ? "top-tool pressure-tool active"
          : "top-tool pressure-tool"
      }
      disabled={disabled}
      onClick={onClick}
      title={enabled ? "Pen pressure ON" : "Pen pressure OFF"}
      aria-label={enabled ? "Pen pressure ON" : "Pen pressure OFF"}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: "18px",
          fontWeight: 700,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        ↕
      </span>
    </button>
  );
}

function TopToolbar({
  tool,
  locked,
  penPressureEnabled,
  onLockToggle,
  onToolChange,
  onPenPressureToggle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onMore,
}: TopToolbarProps) {
  return (
    <header className="top-toolbar">
      <ToolButton
        icon={locked ? "lock" : "unlock"}
        label={locked ? "Locked" : "Unlocked"}
        active={locked}
        onClick={onLockToggle}
      />

      <div className="top-toolbar-divider" />

      <ToolButton
        icon="hand"
        label="Hand / Pan"
        active={tool === "hand"}
        disabled={locked}
        onClick={() => onToolChange("hand")}
      />

      <ToolButton
        icon="select"
        label="Select / Cursor"
        active={tool === "select"}
        disabled={locked}
        onClick={() => onToolChange("select")}
      />

      <ToolButton
        icon="rectangle"
        label="Rectangle"
        active={tool === "rectangle"}
        disabled={locked}
        onClick={() => onToolChange("rectangle")}
      />

      <ToolButton
        icon="diamond"
        label="Diamond"
        active={tool === "diamond"}
        disabled={locked}
        onClick={() => onToolChange("diamond")}
      />

      <ToolButton
        icon="ellipse"
        label="Ellipse"
        active={tool === "ellipse"}
        disabled={locked}
        onClick={() => onToolChange("ellipse")}
      />

      <ToolButton
        icon="arrow"
        label="Arrow"
        active={tool === "arrow"}
        disabled={locked}
        onClick={() => onToolChange("arrow")}
      />

      <ToolButton
        icon="line"
        label="Line"
        active={tool === "line"}
        disabled={locked}
        onClick={() => onToolChange("line")}
      />

      {/* The only Pen tool button. */}
      <ToolButton
        icon="pen"
        label="Pen"
        active={tool === "draw"}
        disabled={locked}
        onClick={() => onToolChange("draw")}
      />

      {/* Pressure is a separate control, but it is NOT another pen icon. */}
      {tool === "draw" && (
        <PressureButton
          enabled={penPressureEnabled}
          disabled={locked}
          onClick={onPenPressureToggle}
        />
      )}

      <ToolButton
        icon="text"
        label="Text"
        active={tool === "text"}
        disabled={locked}
        onClick={() => onToolChange("text")}
      />

      <ToolButton
        icon="note"
        label="Note"
        active={tool === "note"}
        disabled={locked}
        onClick={() => onToolChange("note")}
      />

      <ToolButton
        icon="eraser"
        label="Eraser"
        active={tool === "eraser"}
        disabled={locked}
        onClick={() => onToolChange("eraser")}
      />

      <ToolButton
        icon="more"
        label="More tools"
        onClick={onMore}
      />

      <div className="top-toolbar-divider" />

      <ToolButton
        icon="undo"
        label="Undo"
        disabled={!canUndo}
        onClick={onUndo}
      />

      <ToolButton
        icon="redo"
        label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
      />
    </header>
  );
}

export default TopToolbar;
