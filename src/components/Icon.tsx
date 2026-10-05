import type { SVGProps } from "react";

export type IconName =
  | "lock"
  | "unlock"
  | "hand"
  | "select"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "note"
  | "eraser"
  | "more"
  | "menu"
  | "undo"
  | "redo"
  | "folder"
  | "save"
  | "export"
  | "users"
  | "command"
  | "search"
  | "help"
  | "trash"
  | "settings"
  | "sun"
  | "moon"
  | "monitor";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: IconProps) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "lock":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <circle
            cx="12"
            cy="15"
            r="1"
          />
        </svg>
      );

    case "unlock":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
          />
          <path d="M8 10V7a4 4 0 0 1 7-2" />
          <circle
            cx="12"
            cy="15"
            r="1"
          />
        </svg>
      );

    case "hand":
      return (
        <svg {...common}>
          <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4" />
          <path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10" />
          <path d="M13 10V6a1.5 1.5 0 0 1 3 0v6" />
          <path d="M16 11V9a1.5 1.5 0 0 1 3 0v5c0 4-2.5 6-6 6h-1c-3 0-4.5-2-6-4l-2-3a1.5 1.5 0 0 1 2.5-1.7L7 13" />
        </svg>
      );

    case "select":
      return (
        <svg {...common}>
          <path d="M5 3l6 15 2.2-6.2L19 9 5 3z" />
        </svg>
      );

    case "rectangle":
      return (
        <svg {...common}>
          <rect
            x="4"
            y="5"
            width="16"
            height="14"
            rx="1"
          />
        </svg>
      );

    case "diamond":
      return (
        <svg {...common}>
          <path d="M12 3l8 9-8 9-8-9 8-9z" />
        </svg>
      );

    case "ellipse":
      return (
        <svg {...common}>
          <ellipse
            cx="12"
            cy="12"
            rx="8"
            ry="6"
          />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M4 12h15" />
          <path d="M14 6l6 6-6 6" />
        </svg>
      );

    case "line":
      return (
        <svg {...common}>
          <path d="M5 19L19 5" />
        </svg>
      );

    case "pen":
      return (
        <svg {...common}>
          <path d="M4 20l4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20z" />
          <path d="M13.5 7.5l3 3" />
        </svg>
      );

    case "text":
      return (
        <svg {...common}>
          <path d="M5 5h14" />
          <path d="M12 5v14" />
          <path d="M8 19h8" />
        </svg>
      );

    case "note":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="4"
            width="14"
            height="16"
            rx="2"
          />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );

    case "eraser":
      return (
        <svg {...common}>
          <path d="M7 19h10" />
          <path d="M5 15l8-9a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3l-6 7H8l-3-3a2 2 0 0 1 0-1z" />
          <path d="M12 18l-5-5" />
        </svg>
      );

    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );

    case "undo":
      return (
        <svg {...common}>
          <path d="M9 7L4 12l5 5" />
          <path d="M4 12h9a6 6 0 0 1 6 6" />
        </svg>
      );

    case "redo":
      return (
        <svg {...common}>
          <path d="M15 7l5 5-5 5" />
          <path d="M20 12h-9a6 6 0 0 0-6 6" />
        </svg>
      );

    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      );

    case "save":
      return (
        <svg {...common}>
          <path d="M5 3h12l3 3v15H5z" />
          <path d="M8 3v6h8V3" />
          <path d="M8 21v-7h8v7" />
        </svg>
      );

    case "export":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="M7 8l5-5 5 5" />
          <path d="M5 14v5h14v-5" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle
            cx="9"
            cy="8"
            r="3"
          />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <path d="M16 11a3 3 0 0 0 0-6" />
          <path d="M17 14a5 5 0 0 1 4 5" />
        </svg>
      );

    case "command":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M9.5 7h5" />
          <path d="M9.5 17h5" />
          <path d="M7 9.5v5" />
          <path d="M17 9.5v5" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
          />
          <path d="M16 16l5 5" />
        </svg>
      );

    case "help":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 2" />
          <circle
            cx="12"
            cy="16.5"
            r=".6"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M9 7V4h6v3" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="3"
          />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.6-1H6v-2.5h.5a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5H15v.5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.6 1z" />
        </svg>
      );

    case "sun":
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="4"
          />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.9 4.9l1.4 1.4" />
          <path d="M17.7 17.7l1.4 1.4" />
          <path d="M19.1 4.9l-1.4 1.4" />
          <path d="M6.3 17.7l-1.4 1.4" />
        </svg>
      );

    case "moon":
      return (
        <svg {...common}>
          <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" />
        </svg>
      );

    case "monitor":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="4"
            width="18"
            height="13"
            rx="2"
          />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      );

    default:
      return null;
  }
}

export default Icon;