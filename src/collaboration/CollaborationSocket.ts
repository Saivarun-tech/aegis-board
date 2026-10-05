import type { AegisElement } from "../canvas/types";

export type CollaborationPermission =
  | "read"
  | "write";

export type CollaborationTheme =
  | "light"
  | "dark"
  | "system";

export type CollaborationBoard = {
  elements: AegisElement[];
  pan: {
    x: number;
    y: number;
  };
  canvasBackground: string;
  theme: CollaborationTheme;
};

export type CollaborationConnectedMessage = {
  type: "collaboration:connected";
  session_id: string;
  permission: CollaborationPermission;
  board: CollaborationBoard;
};

export type CollaborationBoardUpdateMessage = {
  type: "board:update";
  elements: AegisElement[];
  pan: {
    x: number;
    y: number;
  };
  canvasBackground: string;
  theme: CollaborationTheme;
  updated_by?: string;
};

export type CollaborationEndedMessage = {
  type: "collaboration:ended";
};

export type CollaborationErrorMessage = {
  type: "error";
  message: string;
};

export type CollaborationPongMessage = {
  type: "pong";
};

export type CollaborationMessage =
  | CollaborationConnectedMessage
  | CollaborationBoardUpdateMessage
  | CollaborationEndedMessage
  | CollaborationErrorMessage
  | CollaborationPongMessage;

type CollaborationSocketOptions = {
  sessionId: string;
  onConnected: (
    message: CollaborationConnectedMessage,
  ) => void;
  onBoardUpdate: (
    message: CollaborationBoardUpdateMessage,
  ) => void;
  onEnded: () => void;
  onError: (message: string) => void;
  onDisconnected: () => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

class CollaborationSocket {
  private socket: WebSocket | null = null;

  private readonly sessionId: string;

  private readonly options: CollaborationSocketOptions;

  constructor(
    options: CollaborationSocketOptions,
  ) {
    this.options = options;
    this.sessionId = options.sessionId;
  }

  connect() {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const apiUrl = new URL(API_BASE_URL);

    const protocol =
      apiUrl.protocol === "https:"
        ? "wss:"
        : "ws:";

    const url =
      `${protocol}//${apiUrl.host}` +
      `/api/collaboration/ws/${this.sessionId}`;

    const socket = new WebSocket(url);

    this.socket = socket;

    socket.onopen = () => {
      // The browser automatically includes the existing
      // Aegis session cookie for the WebSocket handshake.
    };

    socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    socket.onerror = () => {
      this.options.onError(
        "Collaboration WebSocket error.",
      );
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      this.options.onDisconnected();
    };
  }

  private handleMessage(rawMessage: string) {
    let message: CollaborationMessage;

    try {
      message =
        JSON.parse(
          rawMessage,
        ) as CollaborationMessage;
    } catch {
      this.options.onError(
        "Received an invalid collaboration message.",
      );

      return;
    }

    switch (message.type) {
      case "collaboration:connected":
        this.options.onConnected(message);
        break;

      case "board:update":
        this.options.onBoardUpdate(message);
        break;

      case "collaboration:ended":
        this.options.onEnded();
        this.disconnect();
        break;

      case "error":
        this.options.onError(
          message.message,
        );
        break;

      case "pong":
        break;

      default:
        this.options.onError(
          "Unknown collaboration message.",
        );
    }
  }

  sendBoardUpdate(
    elements: AegisElement[],
    pan: { x: number; y: number },
    canvasBackground: string,
    theme: CollaborationTheme,
  ) {
    if (!this.isConnected()) {
      return;
    }

    this.socket?.send(
      JSON.stringify({
        type: "board:update",
        elements,
        pan,
        canvasBackground,
        theme,
      }),
    );
  }

  ping() {
    if (!this.isConnected()) {
      return;
    }

    this.socket?.send(
      JSON.stringify({
        type: "ping",
      }),
    );
  }

  disconnect() {
    const socket = this.socket;

    this.socket = null;

    if (!socket) {
      return;
    }

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;

    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  }

  isConnected() {
    return (
      this.socket?.readyState ===
      WebSocket.OPEN
    );
  }
}

export default CollaborationSocket;