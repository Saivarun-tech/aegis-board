import {
  useRef,
} from "react";

import Icon from "./Icon";

type ToolMenuProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  onExport: () => void;
  onSave: () => void;

  onLiveCollaboration: () => void;

  onOpenFiles?: (
    files: FileList,
  ) => void;
};

function ToolMenu({
  open,
  onClose,
  onReset,
  onExport,
  onSave,
  onLiveCollaboration,
  onOpenFiles,
}: ToolMenuProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  const handleOpenClick = () => {
    const input =
      fileInputRef.current;

    if (!input) {
      return;
    }

    input.value = "";

    input.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      event.currentTarget.files;

    if (
      files &&
      files.length > 0 &&
      onOpenFiles
    ) {
      onOpenFiles(files);
    }

    event.currentTarget.value = "";

    onClose();
  };

  const handleTheme = (
    theme:
      | "light"
      | "dark"
      | "system",
  ) => {
    if (
      theme === "system"
    ) {
      document.documentElement.removeAttribute(
        "data-theme",
      );

      return;
    }

    document.documentElement.dataset.theme =
      theme;
  };

  const handleCanvasBackground = (
    value: string,
  ) => {
    document.documentElement.style.setProperty(
      "--aegis-canvas-bg",
      value,
    );
  };

  return (
    <>
      {/* =================================================
          FILE PICKER
          ================================================= */}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept={[
          "image/*",
          ".png",
          ".jpg",
          ".jpeg",
          ".webp",
          ".gif",
          ".bmp",
          ".svg",
          ".pdf",
          "application/pdf",
        ].join(",")}
        onChange={
          handleFileChange
        }
      />

      {/* =================================================
          ORIGINAL AEGIS MENU
          ================================================= */}

      <div
        className="aegis-menu"
        role="menu"
      >
        {/* OPEN */}

        <button
          type="button"
          className="menu-item"
          onClick={
            handleOpenClick
          }
        >
          <Icon
            name="folder"
            size={18}
          />

          <span className="menu-label">
            Open
          </span>

          <kbd>
            Ctrl O
          </kbd>
        </button>

        {/* SAVE */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onSave();
            onClose();
          }}
        >
          <Icon
            name="save"
            size={18}
          />

          <span className="menu-label">
            Save to (Image)
          </span>

          <kbd>
            Ctrl S
          </kbd>
        </button>

        {/* EXPORT */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onExport();
            onClose();
          }}
        >
          <Icon
            name="export"
            size={18}
          />

          <span className="menu-label">
            Export image
          </span>

          <kbd>
            Ctrl Shift E
          </kbd>
        </button>

        {/* LIVE COLLABORATION */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onClose();
            onLiveCollaboration();
          }}
        >
          <Icon
            name="users"
            size={18}
          />

          <span className="menu-label">
            Live collaboration
          </span>
        </button>

        {/* COMMAND PALETTE */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onClose();

            window.alert(
              "Command palette is coming next.",
            );
          }}
        >
          <Icon
            name="command"
            size={18}
          />

          <span className="menu-label">
            Command palette
          </span>

          <kbd>
            Ctrl K
          </kbd>
        </button>

        {/* FIND */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onClose();

            window.alert(
              "Find on canvas is coming next.",
            );
          }}
        >
          <Icon
            name="search"
            size={18}
          />

          <span className="menu-label">
            Find on canvas
          </span>

          <kbd>
            Ctrl F
          </kbd>
        </button>

        {/* HELP */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onClose();

            window.alert(
              "Aegis Board help is coming next.",
            );
          }}
        >
          <Icon
            name="help"
            size={18}
          />

          <span className="menu-label">
            Help
          </span>
        </button>

        {/* DIVIDER */}

        <div className="menu-separator" />

        {/* RESET */}

        <button
          type="button"
          className="menu-item danger"
          onClick={() => {
            onReset();
            onClose();
          }}
        >
          <Icon
            name="trash"
            size={18}
          />

          <span className="menu-label">
            Reset
          </span>
        </button>

        {/* PREFERENCES */}

        <button
          type="button"
          className="menu-item"
          onClick={() => {
            onClose();

            window.alert(
              "Preferences are coming next.",
            );
          }}
        >
          <Icon
            name="settings"
            size={18}
          />

          <span className="menu-label">
            Preferences
          </span>
        </button>

        {/* =================================================
            THEME
            ================================================= */}

        <div className="menu-label">
          Theme
        </div>

        <div className="theme-switcher">
          <button
            type="button"
            onClick={() =>
              handleTheme(
                "light",
              )
            }
          >
            <Icon
              name="sun"
              size={15}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              handleTheme(
                "dark",
              )
            }
          >
            <Icon
              name="moon"
              size={15}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              handleTheme(
                "system",
              )
            }
          >
            <Icon
              name="monitor"
              size={15}
            />
          </button>
        </div>

        {/* =================================================
            CANVAS BACKGROUND
            ================================================= */}

        <div className="menu-label">
          Canvas background
        </div>

        <div className="background-options">
          <button
            type="button"
            onClick={() =>
              handleCanvasBackground(
                "#ffffff",
              )
            }
          >
            White
          </button>

          <button
            type="button"
            onClick={() =>
              handleCanvasBackground(
                "#f4f4f5",
              )
            }
          >
            Gray
          </button>

          <button
            type="button"
            onClick={() =>
              handleCanvasBackground(
                "#fffaf0",
              )
            }
          >
            Warm
          </button>
        </div>
      </div>
    </>
  );
}

export default ToolMenu;