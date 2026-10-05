import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import {
  getElementBounds,
  renderScene,
} from "./canvas/renderer";

import type {
  AegisElement,
  FillStyle,
  ImageElement,
  Point,
  ShapeElement,
  ShapeType,
  StrokeStyle,
  TextAlign,
  TextElement,
  Tool,
} from "./canvas/types";

import TopToolbar from "./components/TopToolbar";
import ToolMenu from "./components/ToolMenu";
import PropertiesPanel from "./components/PropertiesPanel";
import TextPropertiesPanel from "./components/TextPropertiesPanel";
import ShapePropertiesPanel from "./components/ShapePropertiesPanel";
import MoreToolsMenu from "./components/MoreToolsMenu";
import Icon from "./components/Icon";
import {
  importMediaFile,
} from "./utils/mediaImport";
import AuthUI from "./components/AuthUI";
import CollaborationManagement from "./components/CollaborationManagement";
import EmployeeCollaboration from "./components/EmployeeCollaboration";
import LoginScreen from "./auth/LoginScreen";
import FirstLoginScreen from "./auth/FirstLoginScreen";
import {
  getCurrentUser,
  type AuthUser,
} from "./auth/authApi";
import CollaborationSocket from "./collaboration/CollaborationSocket";

const SHAPE_TOOLS: Tool[] = [
  "rectangle",
  "diamond",
  "ellipse",
  "arrow",
  "line",
  "note",
];

const isShapeTool = (
  tool: Tool,
): tool is ShapeType =>
  SHAPE_TOOLS.includes(tool);

const DEFAULT_SHAPE_STYLE = {
  stroke: "#111111",
  background: "transparent",
  fillStyle:
    "solid" as FillStyle,
  strokeWidth: 3,
  strokeStyle:
    "solid" as StrokeStyle,
  opacity: 1,
  roughness: 2,
};

function App() {
  // ==================================================
  // REFS
  // ==================================================

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const textAreaRef =
    useRef<HTMLTextAreaElement>(null);

  const elementsRef =
    useRef<AegisElement[]>([]);

  const personalElementsRef =
  useRef<AegisElement[] | null>(null);

const personalPanRef =
  useRef<{
    x: number;
    y: number;
  } | null>(null);
const personalThemeRef =
  useRef<string | null>(null);

const personalCanvasBackgroundRef =
  useRef<string | null>(null);
const collaborationPermissionRef =
  useRef<"read" | "write" | null>(null);

  const collaborationSocketRef =
    useRef<CollaborationSocket | null>(null);

  const collaborationSessionIdRef =
    useRef<string | null>(null);


  const panRef =
    useRef({ x: 0, y: 0 });

const canEdit = () => {
  return (
    collaborationPermissionRef.current !== "read" &&
    !locked
  );
};

  const selectedIdRef =
    useRef<string | null>(null);

  const drawingRef =
    useRef(false);

  const drawingPointerTypeRef =
    useRef<
      PointerEvent["pointerType"]
    >("mouse");

  const panningRef =
    useRef(false);

  const selectingRef =
    useRef(false);

  const textCreatingRef =
    useRef(false);

  const shapeCreatingRef =
    useRef(false);

  const currentPointsRef =
    useRef<Point[]>([]);

  const panStartRef =
    useRef<Point | null>(null);

  const panOriginRef =
    useRef<Point | null>(null);

  const selectionStartRef =
    useRef<Point | null>(null);

  const textStartRef =
    useRef<Point | null>(null);

  const shapeStartRef =
    useRef<Point | null>(null);

  const originalElementsRef =
    useRef<AegisElement[] | null>(
      null,
    );

  const previewElementRef =
    useRef<AegisElement | null>(
      null,
    );

  const textDraftRef =
    useRef<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const editingTextIdRef =
    useRef<string | null>(null);

  // ==================================================
  // MAIN STATE
  // ==================================================

  const [elements, setElements] =
    useState<AegisElement[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [tool, setTool] =
    useState<Tool>("select");

  const [locked, setLocked] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);


  const [
  collaborationOpen,
  setCollaborationOpen,
] = useState(false);


const [employeeCollaborationOpen, setEmployeeCollaborationOpen] =
  useState(false);
const [collaborationMode, setCollaborationMode] =
  useState(false);
  const [pdfPicker, setPdfPicker] =
  useState<{
    file: File;
    name: string;
    totalPages: number;
    pageNumber: number;
  } | null>(null);

const [pdfLoading, setPdfLoading] =
  useState(false);

  const [moreOpen, setMoreOpen] =
    useState(false);

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const [past, setPast] =
    useState<AegisElement[][]>([]);

  const [future, setFuture] =
    useState<AegisElement[][]>([]);


  const [authUser, setAuthUser] =
  useState<AuthUser | null>(null);

const [authChecking, setAuthChecking] =
  useState(true);

  const handleAuthChange = useCallback(
    (user: AuthUser | null) => {
      setAuthUser(user);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const checkAuthentication = async () => {
      try {
        const user = await getCurrentUser();

        if (!cancelled) {
          setAuthUser(user);
        }
      } catch {
        if (!cancelled) {
          setAuthUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    };

    void checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==================================================
  // TEXT
  // ==================================================

  const [textDraft, setTextDraft] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const [textDragRect, setTextDragRect] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const [draftText, setDraftText] =
    useState("");

  const [fontSize, setFontSize] =
    useState(32);

  const [fontFamily, setFontFamily] =
    useState("Inter");

  const [fontWeight, setFontWeight] =
    useState(400);

  const [textColor, setTextColor] =
    useState("#111111");

  const [textAlign, setTextAlign] =
    useState<TextAlign>("left");

  const [textOpacity, setTextOpacity] =
    useState(1);

  // ==================================================
  // SHAPE SETTINGS
  // ==================================================

  const [shapeStroke, setShapeStroke] =
    useState(
      DEFAULT_SHAPE_STYLE.stroke,
    );

  const [shapeBackground, setShapeBackground] =
    useState(
      DEFAULT_SHAPE_STYLE.background,
    );

  const [shapeFillStyle, setShapeFillStyle] =
    useState<FillStyle>(
      DEFAULT_SHAPE_STYLE.fillStyle,
    );

  const [shapeStrokeWidth, setShapeStrokeWidth] =
    useState(
      DEFAULT_SHAPE_STYLE.strokeWidth,
    );

  const [shapeStrokeStyle, setShapeStrokeStyle] =
    useState<StrokeStyle>(
      DEFAULT_SHAPE_STYLE.strokeStyle,
    );

  const [shapeOpacity, setShapeOpacity] =
    useState(
      DEFAULT_SHAPE_STYLE.opacity,
    );

  const [shapeRoughness, setShapeRoughness] =
    useState(
      DEFAULT_SHAPE_STYLE.roughness,
    );

  // ==================================================
  // PEN
  // ==================================================

  const [penStroke, setPenStroke] =
    useState("#111111");

  const [penStrokeWidth, setPenStrokeWidth] =
    useState(3);

  const [penOpacity, setPenOpacity] =
    useState(1);

  const [penPressureEnabled, setPenPressureEnabled] =
    useState(false);

  // ==================================================
  // STATE HELPERS
  // ==================================================

  const broadcastBoardUpdate = useCallback(
  (
    nextElements: AegisElement[],
    nextPan = panRef.current,
  ) => {
    const socket =
      collaborationSocketRef.current;

    if (
      !socket ||
      !socket.isConnected() ||
      collaborationPermissionRef.current !== "write"
    ) {
      return;
    }

    const root =
      document.documentElement;

    const canvasBackground =
      getComputedStyle(root)
        .getPropertyValue(
          "--aegis-canvas-bg",
        )
        .trim() || "#ffffff";

    const theme =
      root.dataset.theme === "dark"
        ? "dark"
        : root.dataset.theme === "light"
          ? "light"
          : "system";

    socket.sendBoardUpdate(
      structuredClone(nextElements),
      {
        x: nextPan.x,
        y: nextPan.y,
      },
      canvasBackground,
      theme,
    );
  },
  [],
);

  const updateElements = useCallback(
    (next: AegisElement[]) => {
      elementsRef.current = next;
      setElements(next);

      broadcastBoardUpdate(next);
    },
    [broadcastBoardUpdate],
  );

  const applySharedBoard = useCallback(
  (board: {
    elements: AegisElement[];
    pan: {
      x: number;
      y: number;
    };
    canvasBackground: string;
    theme:
      | "light"
      | "dark"
      | "system";
  }) => {
    const sharedElements =
      structuredClone(
        board.elements,
      );

    const sharedPan = {
      x: board.pan.x,
      y: board.pan.y,
    };

    elementsRef.current =
      sharedElements;

    setElements(
      sharedElements,
    );

    panRef.current =
      sharedPan;

    setPan(
      sharedPan,
    );

    /*
     * Apply the shared collaboration
     * appearance temporarily.
     */
const root = document.documentElement;

root.dataset.aegisCollaboration = "true";

root.style.setProperty(
  "--aegis-collaboration-canvas-bg",
  board.canvasBackground,
);

if (board.theme === "system") {
  root.removeAttribute("data-theme");
} else {
  root.dataset.theme = board.theme;
}

    selectedIdRef.current =
      null;

    setSelectedId(null);

    setPast([]);

    setFuture([]);

    requestAnimationFrame(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      renderScene(
        canvas,
        sharedElements,
        sharedPan.x,
        sharedPan.y,
        null,
        null,
        null,
      );
    });
  },
  [],
);
const exitCollaboration = useCallback(() => {
  const socket =
    collaborationSocketRef.current;

  collaborationSocketRef.current =
    null;

  collaborationSessionIdRef.current =
    null;

  if (socket) {
    socket.disconnect();
  }

  if (
    personalElementsRef.current
  ) {
    const personalElements =
      structuredClone(
        personalElementsRef.current,
      );

    const personalPan =
      personalPanRef.current
        ? {
            ...personalPanRef.current,
          }
        : {
            x: 0,
            y: 0,
          };

    elementsRef.current =
      personalElements;

    setElements(
      personalElements,
    );

    panRef.current =
      personalPan;

    setPan(
      personalPan,
    );

    personalElementsRef.current =
      null;

    personalPanRef.current =
      null;
  }

  /*
   * Restore the user's personal
   * appearance after collaboration.
   */
  if (
    personalThemeRef.current ===
    "system"
  ) {
    document.documentElement.removeAttribute(
      "data-theme",
    );
  } else if (
    personalThemeRef.current
  ) {
    document.documentElement.dataset.theme =
      personalThemeRef.current;
  } else {
    document.documentElement.removeAttribute(
      "data-theme",
    );
  }

const root = document.documentElement;

root.removeAttribute(
  "data-aegis-collaboration",
);

root.style.removeProperty(
  "--aegis-collaboration-canvas-bg",
);

if (
  personalCanvasBackgroundRef.current
) {
  root.style.setProperty(
    "--aegis-canvas-bg",
    personalCanvasBackgroundRef.current,
  );
}

  personalThemeRef.current =
    null;

  personalCanvasBackgroundRef.current =
    null;

  collaborationPermissionRef.current =
    null;

  setCollaborationMode(false);

  setLocked(false);

  selectedIdRef.current =
    null;

  setSelectedId(null);

  setPast([]);

  setFuture([]);

  setTool("select");
}, []);

  const leaveCollaboration = useCallback(async () => {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:8000";

  const endpoint =
    authUser?.role === "admin"
      ? "/api/collaboration/end"
      : "/api/collaboration/leave";

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      let message =
        "Failed to leave collaboration.";

      try {
        const data = await response.json();

        if (
          typeof data === "object" &&
          data !== null &&
          "detail" in data
        ) {
          message = String(
            (
              data as {
                detail?: unknown;
              }
            ).detail ??
              message,
          );
        }
      } catch {
        // Ignore invalid error responses.
      }

      throw new Error(message);
    }
  } catch (error) {
    console.error(
      "Failed to leave collaboration:",
      error,
    );
  } finally {
    /*
     * Always restore this user's personal
     * workspace locally.
     *
     * For admin:
     * /end broadcasts collaboration:ended
     * to every connected employee.
     *
     * For employee:
     * /leave removes only this employee.
     */
    exitCollaboration();
  }
}, [
  authUser?.role,
  exitCollaboration,
]);
  const connectCollaboration =
  useCallback(
    (sessionId: string) => {
      collaborationSocketRef.current?.disconnect();

      const socket =
        new CollaborationSocket({
          sessionId,

          onConnected: (
            message,
          ) => {
            collaborationSessionIdRef.current =
              message.session_id;

            collaborationPermissionRef.current =
              message.permission;

            setCollaborationMode(
              true,
            );

            setLocked(
              message.permission ===
                "read",
            );

            setTool("select");

            applySharedBoard(
              message.board,
            );
          },

          onBoardUpdate: (
            message,
          ) => {
            applySharedBoard({
              elements:
                message.elements,

              pan: message.pan,

              canvasBackground:
                message.canvasBackground,

              theme:
                message.theme,
            });
          },

          onEnded: () => {
            exitCollaboration();
          },

          onError: (
            message,
          ) => {
            console.error(
              "Aegis collaboration error:",
              message,
            );
          },

          onDisconnected: () => {
            console.warn(
              "Aegis collaboration WebSocket disconnected.",
            );
          },
        });

      collaborationSocketRef.current =
        socket;

      socket.connect();
    },

    [
      applySharedBoard,
      exitCollaboration,
    ],
  );
  const enterCollaboration =
  useCallback(
    (
      board: {
        elements: AegisElement[];
        pan: {
          x: number;
          y: number;
        };
        canvasBackground: string;
        theme:
          | "light"
          | "dark"
          | "system";
      },
      permission:
        | "read"
        | "write",
    ) => {
      /*
       * Save personal workspace and
       * appearance only once.
       */
      if (
        !personalElementsRef.current
      ) {
        personalElementsRef.current =
          structuredClone(
            elementsRef.current,
          );

        personalPanRef.current = {
          ...panRef.current,
        };

        const root =
          document.documentElement;

        personalThemeRef.current =
          root.dataset.theme ??
          "system";

        personalCanvasBackgroundRef.current =
          getComputedStyle(root)
            .getPropertyValue(
              "--aegis-canvas-bg",
            )
            .trim() ||
          "#ffffff";
      }

      collaborationPermissionRef.current =
        permission;

      setCollaborationMode(
        true,
      );

      setLocked(
        permission === "read",
      );

      setTool("select");

      applySharedBoard(
        board,
      );
    },
    [
      applySharedBoard,
    ],
  );

  const commitElement =
    useCallback(
      (
        element: AegisElement,
      ) => {
        if (!canEdit()) {
  return;
}
        const previous =
          elementsRef.current;

        setPast(
          (history) => [
            ...history,
            structuredClone(
              previous,
            ),
          ],
        );

        setFuture([]);

        updateElements([
          ...previous,
          element,
        ]);
      },
      [updateElements],
    );

  const commitImportedElements =
    useCallback(
      (
        imported: ImageElement[],
      ) => {

        if (!canEdit()) {
  return;
}
        if (imported.length === 0) {
          return;
        }

        const previous =
          elementsRef.current;

        setPast(
          (history) => [
            ...history,
            structuredClone(
              previous,
            ),
          ],
        );

        setFuture([]);

        updateElements([
          ...previous,
          ...imported,
        ]);
      },
      [updateElements],
    );

  // ==================================================
  // REDRAW
  // ==================================================

  const redraw =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      renderScene(
        canvas,
        elementsRef.current,
        pan.x,
        pan.y,
        selectedIdRef.current,
        previewElementRef.current,
        editingTextIdRef.current,
      );
    }, [
      pan.x,
      pan.y,
      textDraft,
    ]);

  useEffect(() => {
    redraw();
  }, [
    elements,
    selectedId,
    pan,
    redraw,
  ]);

  // ==================================================
  // CANVAS SIZE
  // ==================================================

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const resize =
      () => {
        const dpr =
          window.devicePixelRatio ||
          1;

        canvas.width =
          window.innerWidth *
          dpr;

        canvas.height =
          window.innerHeight *
          dpr;

        canvas.style.width =
          `${window.innerWidth}px`;

        canvas.style.height =
          `${window.innerHeight}px`;

        redraw();
      };

    resize();

    window.addEventListener(
      "resize",
      resize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        resize,
      );
    };
  }, [redraw]);

  // ==================================================
  // WORLD POINT
  // ==================================================

  const getWorldPoint = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): Point => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left -
        pan.x,

      y:
        event.clientY -
        rect.top -
        pan.y,

      pressure:
        event.pointerType ===
        "pen"
          ? event.pressure
          : 0.5,
    };
  };

  // ==================================================
  // CONTEXT MENU
  // ==================================================

  const handleContextMenu =
    (
      event: React.MouseEvent,
    ) => {
      event.preventDefault();
    };

  // ==================================================
  // PAN
  // ==================================================

  const beginPan = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    panningRef.current =
      true;

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pressure: 0.5,
    };

    panOriginRef.current = {
      x: pan.x,
      y: pan.y,
      pressure: 0.5,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const movePan = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !panningRef.current ||
      !panStartRef.current ||
      !panOriginRef.current
    ) {
      return;
    }

    const nextPan = {
      x:
        panOriginRef.current.x +
        event.clientX -
        panStartRef.current.x,
      y:
        panOriginRef.current.y +
        event.clientY -
        panStartRef.current.y,
    };

    panRef.current = nextPan;
    setPan(nextPan);
  };

  const finishPan = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !panningRef.current
    ) {
      return;
    }

    panningRef.current =
      false;

    panStartRef.current =
      null;

    panOriginRef.current =
      null;

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    } catch {
      // Nothing to release.
    }

    broadcastBoardUpdate(
      elementsRef.current,
      panRef.current,
    );
  };

  

  

  // ==================================================
  // PEN
  // ==================================================

  const beginDrawing = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      event.button !== 0
    ) {
      return;
    }

    drawingRef.current =
      true;

    drawingPointerTypeRef.current =
      event.pointerType;

    currentPointsRef.current =
      [
        getWorldPoint(event),
      ];

    // Keep the in-progress pen stroke inside the normal
    // renderer preview path. This makes the stroke visible
    // continuously while drawing instead of only appearing
    // after pointer-up.
    previewElementRef.current = {
      id: "freehand-preview",
      type: "freehand",
      points: [
        ...currentPointsRef.current,
      ],
      stroke: penStroke,
      strokeWidth: penStrokeWidth,
      opacity: penOpacity,
      pressureEnabled:
        penPressureEnabled &&
        event.pointerType === "pen",
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    redraw();
  };

  const moveDrawing = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !drawingRef.current
    ) {
      return;
    }

    const current =
      getWorldPoint(event);

    currentPointsRef.current.push(
      current,
    );

    previewElementRef.current = {
      id: "freehand-preview",
      type: "freehand",
      points: [
        ...currentPointsRef.current,
      ],
      stroke: penStroke,
      strokeWidth: penStrokeWidth,
      opacity: penOpacity,
      pressureEnabled:
        penPressureEnabled &&
        drawingPointerTypeRef.current === "pen",
    };

    redraw();
  };

  const finishDrawing = (
    event?: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !drawingRef.current
    ) {
      return;
    }

    drawingRef.current =
      false;

    if (event) {
      try {
        event.currentTarget.releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // Nothing to release.
      }
    }

    const points =
      currentPointsRef.current;

    previewElementRef.current =
      null;

    if (
      points.length >=
      2
    ) {
      commitElement({
        id: crypto.randomUUID(),

        type: "freehand",

        points: [
          ...points,
        ],

        stroke:
          penStroke,

        strokeWidth:
          penStrokeWidth,

        opacity:
          penOpacity,

        pressureEnabled:
          penPressureEnabled &&
          drawingPointerTypeRef.current ===
            "pen",
      });
    }

    currentPointsRef.current =
      [];

    drawingPointerTypeRef.current =
      "mouse";
  };

  // ==================================================
  // SHAPES
  // ==================================================

  const makeShape = (
    shapeType: ShapeType,
    start: Point,
    end: Point,
  ): ShapeElement => {
    let width =
      end.x -
      start.x;

    let height =
      end.y -
      start.y;

    const isNote =
      shapeType === "note";

    return {
      id:
        "shape-preview",

      type:
        "shape",

      shapeType,

      x:
        start.x,

      y:
        start.y,

      width,

      height,

      stroke:
        shapeStroke,

      background:
        shapeBackground,

      fillStyle:
        shapeFillStyle,

      strokeWidth:
        shapeStrokeWidth,

      strokeStyle:
        shapeStrokeStyle,

      opacity:
        shapeOpacity,

      roughness:
        shapeRoughness,

      noteText:
        isNote
          ? ""
          : undefined,
    };
  };

  const beginShape = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      event.button !== 0
    ) {
      return;
    }

    const point =
      getWorldPoint(event);

    shapeCreatingRef.current =
      true;

    shapeStartRef.current =
      point;

    previewElementRef.current =
      makeShape(
        tool as ShapeType,
        point,
        point,
      );

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    redraw();
  };

  const moveShape = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !shapeCreatingRef.current ||
      !shapeStartRef.current
    ) {
      return;
    }

    const point =
      getWorldPoint(event);

    previewElementRef.current =
      makeShape(
        tool as ShapeType,
        shapeStartRef.current,
        point,
      );

    redraw();
  };

  const finishShape = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      !shapeCreatingRef.current ||
      !shapeStartRef.current
    ) {
      return;
    }

    const point =
      getWorldPoint(event);

    const shape =
      makeShape(
        tool as ShapeType,
        shapeStartRef.current,
        point,
      );

    const size =
      Math.max(
        Math.abs(
          shape.width,
        ),
        Math.abs(
          shape.height,
        ),
      );

    shapeCreatingRef.current =
      false;

    shapeStartRef.current =
      null;

    previewElementRef.current =
      null;

    try {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    } catch {
      // Nothing to release.
    }

    if (size >= 6) {
      const shapeElement = {
        ...shape,
        id: crypto.randomUUID(),
      };

      commitElement(shapeElement);
      selectedIdRef.current = shapeElement.id;
      setSelectedId(shapeElement.id);
    }

    // Shapes are one-shot tools: after finishing,
    // automatically return to Cursor / Select.
    setTool("select");

    redraw();
  };

  // ==================================================
  // TEXT CREATION
  // ==================================================

  const beginTextCreation =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        event.button !== 0
      ) {
        return;
      }

      if (!canEdit()) {
  return;
}

      const point =
        getWorldPoint(event);

      // A text box is its own editing target. Remove any
      // previous selection before drawing the new rectangle.
      selectedIdRef.current = null;
      setSelectedId(null);

      textCreatingRef.current =
        true;

      textStartRef.current =
        point;

      setTextDragRect({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      });

      setDraftText("");

      event.currentTarget.setPointerCapture(
        event.pointerId,
      );
    };

  const moveTextCreation =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        !textCreatingRef.current ||
        !textStartRef.current
      ) {
        return;
      }

      const point =
        getWorldPoint(event);

      const x =
        Math.min(
          textStartRef.current.x,
          point.x,
        );

      const y =
        Math.min(
          textStartRef.current.y,
          point.y,
        );

      const width =
        Math.abs(
          point.x -
            textStartRef.current.x,
        );

      const height =
        Math.abs(
          point.y -
            textStartRef.current.y,
        );

      setTextDragRect({
        x,
        y,
        width,
        height,
      });
    };

  const finishTextCreation =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        !textCreatingRef.current ||
        !textStartRef.current
      ) {
        return;
      }

      const point = getWorldPoint(event);

      const x = Math.min(
        textStartRef.current.x,
        point.x,
      );

      const y = Math.min(
        textStartRef.current.y,
        point.y,
      );

      let width = Math.abs(
        point.x - textStartRef.current.x,
      );

      let height = Math.abs(
        point.y - textStartRef.current.y,
      );

      textCreatingRef.current = false;
      textStartRef.current = null;

      try {
        event.currentTarget.releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // Nothing to release.
      }

      // Even a simple click creates a real rectangular text box.
      // Dragging still preserves the user's rectangle dimensions.
      width = Math.max(240, width);
      height = Math.max(80, height);

      const draft = { x, y, width, height };

      editingTextIdRef.current = null;
      textDraftRef.current = draft;

      setTextDraft(draft);
      setTextDragRect(null);
      setDraftText("");

      requestAnimationFrame(() => {
        const editor = textAreaRef.current;
        if (!editor) return;
        editor.focus();
        editor.setSelectionRange(0, 0);
      });
    };

  const beginEditingText = (element: TextElement) => {
    editingTextIdRef.current = element.id;
    selectedIdRef.current = element.id;
    setSelectedId(element.id);
    setTool("text");

    const draft = {
      x: element.x,
      y: element.y,
      width: Math.max(40, element.width),
      height: Math.max(32, element.height),
    };

    textDraftRef.current = draft;
    setTextDraft(draft);
    setTextDragRect(null);
    setDraftText(element.text);

    setFontSize(element.fontSize);
    setFontFamily(element.fontFamily);
    setFontWeight(element.fontWeight);
    setTextColor(element.color);
    setTextAlign(element.textAlign);
    setTextOpacity(element.opacity);

    requestAnimationFrame(() => {
      const editor = textAreaRef.current;
      if (!editor) return;
      editor.focus();
      editor.setSelectionRange(
        editor.value.length,
        editor.value.length,
      );
    });
  };

  // ==================================================
  // FINISH TEXT
  // ==================================================

  const finishTextEditing = useCallback(() => {
    const position = textDraftRef.current;
    if (!position) return;

    const value = draftText.trimEnd();
    const editingId = editingTextIdRef.current;

    if (editingId) {
      const before = elementsRef.current;

      if (value.trim().length === 0) {
        setPast((history) => [
          ...history,
          structuredClone(before),
        ]);
        setFuture([]);
        updateElements(
          before.filter(
            (element) => element.id !== editingId,
          ),
        );
        selectedIdRef.current = null;
        setSelectedId(null);
      } else {
        const next = before.map((element) => {
          if (
            element.id !== editingId ||
            element.type !== "text"
          ) {
            return element;
          }

          return {
            ...element,
            text: value,
            width: position.width,
            height: position.height,
            fontSize,
            fontFamily,
            fontWeight,
            textAlign,
            color: textColor,
            opacity: textOpacity,
          };
        });

        if (JSON.stringify(before) !== JSON.stringify(next)) {
          setPast((history) => [
            ...history,
            structuredClone(before),
          ]);
          setFuture([]);
          updateElements(next);
        }

        // Finished text should no longer show a selection border.
        selectedIdRef.current = null;
        setSelectedId(null);
      }
    } else if (value.trim().length > 0) {
      const textElement: TextElement = {
        id: crypto.randomUUID(),
        type: "text",
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        text: value,
        fontSize,
        fontFamily,
        fontWeight,
        textAlign,
        color: textColor,
        opacity: textOpacity,
      };

      commitElement(textElement);

      // Finished text returns to a clean canvas with no
      // persistent bounding border.
      selectedIdRef.current = null;
      setSelectedId(null);
    }

    editingTextIdRef.current = null;
    textDraftRef.current = null;
    setTextDraft(null);
    setTextDragRect(null);
    setDraftText("");

    // Text is also a one-shot tool. Once the text is
    // confirmed, return to Cursor / Select.
    setTool("select");
  }, [
    draftText,
    fontSize,
    fontFamily,
    fontWeight,
    textAlign,
    textColor,
    textOpacity,
    commitElement,
    updateElements,
  ]);

  const resizeTextEditor = (editor: HTMLTextAreaElement) => {
    const draft = textDraftRef.current;
    if (!draft) return;

    editor.style.height = "auto";

    const contentHeight = Math.max(
      draft.height,
      editor.scrollHeight,
    );

    editor.style.height = `${contentHeight}px`;

    if (contentHeight !== draft.height) {
      const next = {
        ...draft,
        height: contentHeight,
      };

      textDraftRef.current = next;
      setTextDraft(next);
    }
  };

  // ==================================================
  // HIT TEST
  // ==================================================

  const findElementAtPoint =
    (
      point: Point,
    ): AegisElement | null => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return null;
      }

      const ctx =
        canvas.getContext(
          "2d",
        );

      if (!ctx) {
        return null;
      }

      for (
        let i =
          elementsRef.current
            .length -
          1;
        i >= 0;
        i -= 1
      ) {
        const element =
          elementsRef.current[
            i
          ];

        const bounds =
          getElementBounds(
            ctx,
            element,
          );

        if (
          point.x >=
            bounds.x &&
          point.x <=
            bounds.x +
              bounds.width &&
          point.y >=
            bounds.y &&
          point.y <=
            bounds.y +
              bounds.height
        ) {
          return element;
        }
      }

      return null;
    };

  // ==================================================
  // SELECT
  // ==================================================

 const beginSelection =
  (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (!canEdit()) {
      return;
    }

    if (
      event.button !== 0
    ) {
      return;
    }

    // existing code...

      const point =
        getWorldPoint(event);

      const element =
        findElementAtPoint(
          point,
        );

      if (!element) {
        selectedIdRef.current =
          null;

        setSelectedId(
          null,
        );

        selectingRef.current =
          false;

        originalElementsRef.current =
          null;

        selectionStartRef.current =
          null;

        return;
      }

      selectedIdRef.current =
        element.id;

      setSelectedId(
        element.id,
      );

      selectingRef.current =
        true;

      selectionStartRef.current =
        point;

      originalElementsRef.current =
        structuredClone(
          elementsRef.current,
        );

      event.currentTarget.setPointerCapture(
        event.pointerId,
      );
    };

  const moveSelection =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        !selectingRef.current ||
        !selectionStartRef.current ||
        !originalElementsRef.current ||
        !selectedIdRef.current
      ) {
        return;
      }

      const current =
        getWorldPoint(event);

      const dx =
        current.x -
        selectionStartRef.current.x;

      const dy =
        current.y -
        selectionStartRef.current.y;

      const selectedId =
        selectedIdRef.current;

      const original =
        originalElementsRef.current;

      const next =
        original.map(
          (
            element,
          ) => {
            if (
              element.id !==
              selectedId
            ) {
              return element;
            }

            if (
              element.type ===
              "text"
            ) {
              return {
                ...element,

                x:
                  element.x +
                  dx,

                y:
                  element.y +
                  dy,
              };
            }

            if (
              element.type ===
              "shape"
            ) {
              return {
                ...element,

                x:
                  element.x +
                  dx,

                y:
                  element.y +
                  dy,
              };
            }

            if (
              element.type ===
              "image"
            ) {
              return {
                ...element,

                x:
                  element.x +
                  dx,

                y:
                  element.y +
                  dy,
              };
            }

            return {
              ...element,

              points:
                element.points.map(
                  (
                    point,
                  ) => ({
                    ...point,

                    x:
                      point.x +
                      dx,

                    y:
                      point.y +
                      dy,
                  }),
                ),
            };
          },
        );

      updateElements(
        next,
      );
    };

  const finishSelection =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        !selectingRef.current
      ) {
        return;
      }

      selectingRef.current =
        false;

      try {
        event.currentTarget.releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // Nothing to release.
      }

      const original =
        originalElementsRef.current;

      const current =
        elementsRef.current;

      if (
        original &&
        JSON.stringify(
          original,
        ) !==
          JSON.stringify(
            current,
          )
      ) {
        setPast(
          (history) => [
            ...history,
            original,
          ],
        );

        setFuture([]);
      }

      originalElementsRef.current =
        null;

      selectionStartRef.current =
        null;
    };

  // ==================================================
  // SELECTED ELEMENT
  // ==================================================

  const selectedElement =
    selectedId
      ? elements.find(
          (
            element,
          ) =>
            element.id ===
            selectedId,
        ) ?? null
      : null;

  const selectedText =
    selectedElement?.type ===
    "text"
      ? selectedElement
      : null;

  const selectedShape =
    selectedElement?.type ===
    "shape"
      ? selectedElement
      : null;

  // ==================================================
  // TEXT PROPERTY CHANGES
  // ==================================================

  const handleDraftTextChange =
    (
      changes: Partial<TextElement>,
    ) => {
      if (
        changes.fontSize !==
        undefined
      ) {
        setFontSize(
          changes.fontSize,
        );
      }

      if (
        changes.fontFamily !==
        undefined
      ) {
        setFontFamily(
          changes.fontFamily,
        );
      }

      if (
        changes.fontWeight !==
        undefined
      ) {
        setFontWeight(
          changes.fontWeight,
        );
      }

      if (
        changes.color !==
        undefined
      ) {
        setTextColor(
          changes.color,
        );
      }

      if (
        changes.textAlign !==
        undefined
      ) {
        setTextAlign(
          changes.textAlign,
        );
      }

      if (
        changes.opacity !==
        undefined
      ) {
        setTextOpacity(
          changes.opacity,
        );
      }
    };

  // ==================================================
  // SHAPE PROPERTY CHANGES
  // ==================================================

  const handleDraftShapeChange =
    (
      changes: Partial<ShapeElement>,
    ) => {
      if (
        changes.stroke !==
        undefined
      ) {
        setShapeStroke(
          changes.stroke,
        );
      }

      if (
        changes.background !==
        undefined
      ) {
        setShapeBackground(
          changes.background,
        );
      }

      if (
        changes.fillStyle !==
        undefined
      ) {
        setShapeFillStyle(
          changes.fillStyle,
        );
      }

      if (
        changes.strokeWidth !==
        undefined
      ) {
        setShapeStrokeWidth(
          changes.strokeWidth,
        );
      }

      if (
        changes.strokeStyle !==
        undefined
      ) {
        setShapeStrokeStyle(
          changes.strokeStyle,
        );
      }

      if (
        changes.opacity !==
        undefined
      ) {
        setShapeOpacity(
          changes.opacity,
        );
      }

      if (
        changes.roughness !==
        undefined
      ) {
        setShapeRoughness(
          changes.roughness,
        );
      }
    };

  // ==================================================
  // UPDATE SELECTED
  // ==================================================

  const updateSelectedElement =
    (
      changes: Partial<AegisElement>,
    ) => {
      if (!selectedId) {
        return;
      }

      const before =
        elementsRef.current;

      const next =
        before.map(
          (
            element,
          ) => {
            if (
              element.id !==
              selectedId
            ) {
              return element;
            }

            return {
              ...element,
              ...changes,
            } as AegisElement;
          },
        );

      if (
        JSON.stringify(
          before,
        ) ===
        JSON.stringify(
          next,
        )
      ) {
        return;
      }

      setPast(
        (history) => [
          ...history,
          structuredClone(
            before,
          ),
        ],
      );

      setFuture([]);

      updateElements(
        next,
      );
    };

  // ==================================================
  // DELETE
  // ==================================================
const deleteSelected =
  () => {
    if (!canEdit()) {
      return;
    }

    if (!selectedId) {
      return;
    }

    // existing code...
      const before =
        elementsRef.current;

      setPast(
        (history) => [
          ...history,
          structuredClone(
            before,
          ),
        ],
      );

      setFuture([]);

      updateElements(
        before.filter(
          (
            element,
          ) =>
            element.id !==
            selectedId,
        ),
      );

      selectedIdRef.current =
        null;

      setSelectedId(
        null,
      );
    };

  // ==================================================
  // UNDO
  // ==================================================

  const undo = () => {
    if (
      past.length === 0
    ) 
    if (!canEdit()) {
  return;
}
    
    const previous =
      past[past.length - 1];

    setPast(
      past.slice(0, -1),
    );

    setFuture([
      elementsRef.current,
      ...future,
    ]);

    updateElements(
      previous,
    );

    selectedIdRef.current =
      null;

    setSelectedId(
      null,
    );
  };

  // ==================================================
  // REDO
  // ==================================================

  const redo = () => {
    if (
      future.length === 0
    ) if (!canEdit()) {
  return;
}

    const next =
      future[0];

    setFuture(
      future.slice(1),
    );

    setPast([
      ...past,
      elementsRef.current,
    ]);

    updateElements(
      next,
    );

    selectedIdRef.current =
      null;

    setSelectedId(
      null,
    );
  };

  // ==================================================
  // TOOL CHANGE
  // ==================================================

  const changeTool =
    (
      nextTool: Tool,
    ) => {
      finishDrawing();

      if (
        textDraftRef.current
      ) {
        finishTextEditing();
      }

      textCreatingRef.current =
        false;

      textStartRef.current =
        null;

      shapeCreatingRef.current =
        false;

      shapeStartRef.current =
        null;

      previewElementRef.current =
        null;

      setTextDragRect(
        null,
      );

      selectingRef.current =
        false;

      originalElementsRef.current =
        null;

      selectionStartRef.current =
        null;

      setTool(
        nextTool,
      );

      setMoreOpen(
        false,
      );

      redraw();
    };

  // ==================================================
  // DOUBLE CLICK TEXT TO EDIT
  // ==================================================

  const handleDoubleClick = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
   if (!canEdit()) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const point: Point = {
      x: event.clientX - rect.left - pan.x,
      y: event.clientY - rect.top - pan.y,
      pressure: 0.5,
    };

    const hit = findElementAtPoint(point);

    if (hit?.type === "text") {
      selectedIdRef.current = hit.id;
      setSelectedId(hit.id);
      beginEditingText(hit);
    }
  };

  // ==================================================
  // POINTER DOWN
  // ==================================================

  const handlePointerDown =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      /*
       * RIGHT CLICK = PAN
       */

      if (
        event.button === 2
      ) {
        event.preventDefault();

        if (
          textDraftRef.current
        ) {
          finishTextEditing();
        }

        beginPan(event);

        return;
      }

      if (
        event.button !== 0
      ) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * If a text editor is already open,
       * clicking the board finishes it.
       *
       * We RETURN immediately.
       *
       * Therefore the same click does NOT
       * create another text box.
       */

      if (
        textDraftRef.current
      ) {
        finishTextEditing();

        return;
      }

      /*
       * TEXT
       */

      if (
        tool === "text"
      ) {
        beginTextCreation(
          event,
        );

        return;
      }

      /*
       * SHAPES
       */

      if (
        isShapeTool(tool)
      ) {
        if (canEdit()) {
  beginShape(event);
}

        return;
      }

      /*
       * HAND
       */

      if (
        tool === "hand"
      ) {
        beginPan(event);

        return;
      }

      /*
       * SELECT
       */

      if (
        tool === "select"
      ) {
        if (canEdit()) {
  beginSelection(
    event,
  );
}

        return;
      }

      /*
       * PEN
       */

      if (
        tool === "draw"
      ) {
        if (canEdit()) {
  beginDrawing(
    event,
  );
}

        return;
      }

      /*
       * ERASER
       */

      if (
        tool === "eraser"
      ) {
       if (!canEdit()) {
  return;
}

        const point =
          getWorldPoint(
            event,
          );

        const hit =
          findElementAtPoint(
            point,
          );

        if (!hit) {
          return;
        }

        setPast(
          (history) => [
            ...history,
            structuredClone(
              elementsRef.current,
            ),
          ],
        );

        setFuture([]);

        updateElements(
          elementsRef.current.filter(
            (
              element,
            ) =>
              element.id !==
              hit.id,
          ),
        );

        if (
          selectedIdRef.current ===
          hit.id
        ) {
          selectedIdRef.current =
            null;

          setSelectedId(
            null,
          );
        }
      }
    };

  // ==================================================
  // POINTER MOVE
  // ==================================================

  const handlePointerMove =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        panningRef.current
      ) {
        movePan(event);
        return;
      }

      if (
        selectingRef.current
      ) {
        moveSelection(event);
        return;
      }

      if (
        drawingRef.current
      ) {
        moveDrawing(event);
        return;
      }

      if (
        textCreatingRef.current
      ) {
        moveTextCreation(
          event,
        );

        return;
      }

      if (
        shapeCreatingRef.current
      ) {
        moveShape(event);
      }
    };

  // ==================================================
  // POINTER UP
  // ==================================================

  const handlePointerUp =
    (
      event: ReactPointerEvent<HTMLCanvasElement>,
    ) => {
      if (
        panningRef.current
      ) {
        finishPan(event);
        return;
      }

      if (
        selectingRef.current
      ) {
        finishSelection(
          event,
        );

        return;
      }

      if (
        drawingRef.current
      ) {
        finishDrawing(
          event,
        );

        return;
      }

      if (
        textCreatingRef.current
      ) {
        finishTextCreation(
          event,
        );

        return;
      }

      if (
        shapeCreatingRef.current
      ) {
        finishShape(event);
      }
    };

  // ==================================================
// IMPORT MEDIA
// ==================================================

const handleOpenFiles = async (
  files: FileList,
) => {
  if (!canEdit()) {
  return;
}

  const selectedFiles =
    Array.from(files);

  if (
    selectedFiles.length ===
    0
  ) {
    return;
  }

  try {
    /*
     * ============================================
     * NORMAL IMAGES
     * ============================================
     */

    const imageFiles =
      selectedFiles.filter(
        (file) =>
          file.type.startsWith(
            "image/",
          ),
      );

    const importedGroups =
      await Promise.all(
        imageFiles.map(
          (file) =>
            importMediaFile(file),
        ),
      );

    const importedImages =
      importedGroups.flat();

    /*
     * ============================================
     * PLACE IMAGES
     * ============================================
     *
     * Screenshots/photos use the smaller
     * 3 × 2 grid.
     */

    if (
      importedImages.length > 0
    ) {
      const columns = 3;

      const gapX = 40;
      const gapY = 40;

      const slotWidth = 400;
      const slotHeight = 320;

      const startX = 80;
      const startY = 100;

      const importedElements:
        ImageElement[] = [];

      importedImages.forEach(
        (
          media,
          index,
        ) => {
          const column =
            index %
            columns;

          const row =
            Math.floor(
              index /
                columns,
            );

          const slotX =
            startX +
            column *
              (slotWidth +
                gapX);

          const slotY =
            startY +
            row *
              (slotHeight +
                gapY);

          const x =
            slotX +
            (slotWidth -
              media.width) /
              2 -
            pan.x;

          const y =
            slotY +
            (slotHeight -
              media.height) /
              2 -
            pan.y;

          importedElements.push(
            {
              id:
                crypto.randomUUID(),

              type:
                "image",

              x,

              y,

              width:
                media.width,

              height:
                media.height,

              src:
                media.src,

              name:
                media.name,

              opacity: 1,

              sourceType:
                "image",
            },
          );
        },
      );

      commitImportedElements(
        importedElements,
      );

      const last =
        importedElements[
          importedElements.length -
            1
        ];

      if (last) {
        selectedIdRef.current =
          last.id;

        setSelectedId(
          last.id,
        );
      }
    }

    /*
     * ============================================
     * PDF
     * ============================================
     *
     * Do NOT render all pages.
     *
     * Open the page selector instead.
     */
    const pdfFile =
      selectedFiles.find(
        (file) =>
          file.type ===
            "application/pdf" ||
          file.name
            .toLowerCase()
            .endsWith(".pdf"),
      );

    if (pdfFile) {
      const {
        inspectPdfFile,
      } = await import(
        "./utils/pdfImport"
      );

      const pdf =
        await inspectPdfFile(
          pdfFile,
        );

      setPdfPicker({
        file:
          pdf.file,

        name:
          pdf.name,

        totalPages:
          pdf.totalPages,

        pageNumber: 1,
      });
    }
  } catch (error) {
    console.error(
      "Aegis media import failed:",
      error,
    );

    window.alert(
      "Aegis could not open the selected file. Check the browser console for details.",
    );
  }
};
const addSelectedPdfPage =
  async () => {
    if (!pdfPicker) {
      return;
    }

    const pageNumber =
      Math.max(
        1,
        Math.min(
          pdfPicker.pageNumber,
          pdfPicker.totalPages,
        ),
      );

    try {
      setPdfLoading(true);

      const {
        importPdfPage,
      } = await import(
        "./utils/pdfImport"
      );

      const media =
        await importPdfPage(
          pdfPicker.file,
          pageNumber,
        );

      /*
       * PDF pages get their own larger
       * grid spacing.
       */

      const pdfGapX = 60;
      const pdfGapY = 60;

      const pdfSlotWidth = 660;
      const pdfSlotHeight = 780;

      /*
       * Put each newly selected PDF
       * page after the existing elements.
       *
       * This keeps repeatedly adding
       * pages from the same PDF simple.
       */

      const existingPdfCount =
        elementsRef.current.filter(
          (
            element,
          ) =>
            element.type ===
              "image" &&
            element.sourceType ===
              "pdf",
        ).length;

      const column =
        existingPdfCount % 3;

      const row =
        Math.floor(
          existingPdfCount /
            3,
        );

      const slotX =
        80 +
        column *
          (pdfSlotWidth +
            pdfGapX);

      const slotY =
        100 +
        row *
          (pdfSlotHeight +
            pdfGapY);

      const x =
        slotX +
        (pdfSlotWidth -
          media.width) /
          2 -
        pan.x;

      const y =
        slotY +
        (pdfSlotHeight -
          media.height) /
          2 -
        pan.y;

      const element:
        ImageElement = {
        id:
          crypto.randomUUID(),

        type:
          "image",

        x,

        y,

        width:
          media.width,

        height:
          media.height,

        src:
          media.src,

        name:
          media.name,

        opacity: 1,

        sourceType:
          "pdf",

        pageNumber:
          media.pageNumber,

        totalPages:
          media.totalPages,
      };

      commitImportedElements(
        [element],
      );

      selectedIdRef.current =
        element.id;

      setSelectedId(
        element.id,
      );
    } catch (error) {
      console.error(
        "Aegis PDF page import failed:",
        error,
      );

      window.alert(
        "Aegis could not render that PDF page.",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // ==================================================
  // RESET
  // ==================================================

  const resetCanvas =
    () => {
      if (!canEdit()) {
        return;
      }

      setPast(
        (history) => [
          ...history,
          structuredClone(
            elementsRef.current,
          ),
        ],
      );

      setFuture([]);

      updateElements([]);

      selectedIdRef.current =
        null;

      setSelectedId(
        null,
      );

      const nextPan = {
        x: 0,
        y: 0,
      };

      panRef.current = nextPan;
      setPan(nextPan);
      broadcastBoardUpdate([], nextPan);
    };
   // ==================================================
// SAVE TO IMAGE
// ==================================================

const saveBoardImage = async () => {
  const canvas =
    canvasRef.current;

  if (!canvas) {
    return;
  }

  try {
    const imageData =
      canvas.toDataURL(
        "image/png",
      );

    const pickerWindow =
      window as Window & {
        showSaveFilePicker?: (
          options?: {
            suggestedName?: string;
            types?: Array<{
              description: string;
              accept: Record<
                string,
                string[]
              >;
            }>;
          },
        ) => Promise<{
          createWritable: () => Promise<{
            write: (
              data: Blob,
            ) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      };

    /*
     * Preferred:
     * Windows Save As dialog.
     */

    if (
      pickerWindow.showSaveFilePicker
    ) {
      const handle =
        await pickerWindow.showSaveFilePicker(
          {
            suggestedName:
              "aegis-board.png",

            types: [
              {
                description:
                  "PNG Image",

                accept: {
                  "image/png": [
                    ".png",
                  ],
                },
              },
            ],
          },
        );

      const response =
        await fetch(
          imageData,
        );

      const blob =
        await response.blob();

      const writable =
        await handle.createWritable();

      await writable.write(
        blob,
      );

      await writable.close();

      return;
    }

    /*
     * Fallback:
     * Normal browser download.
     */

    const link =
      document.createElement(
        "a",
      );

    link.href =
      imageData;

    link.download =
      "aegis-board.png";

    link.click();
  } catch (error) {
    /*
     * User cancelled
     * the Save dialog.
     */

    if (
      error instanceof DOMException &&
      error.name ===
        "AbortError"
    ) {
      return;
    }

    console.error(
      "Aegis image save failed:",
      error,
    );

    window.alert(
      "Aegis could not save the board image.",
    );
  }
};

  // ==================================================
  // EXPORT
  // ==================================================

  const exportImage =
    () => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const link =
        document.createElement(
          "a",
        );

      link.download =
        "aegis-board.png";

      link.href =
        canvas.toDataURL(
          "image/png",
        );

      link.click();
    };

  // ==================================================
  // DRAFT TEXT
  // ==================================================

  const draftTextElement:
    TextElement = {
    id:
      "text-draft",

    type:
      "text",

    x:
      textDraft?.x ?? 0,

    y:
      textDraft?.y ?? 0,

    width:
      textDraft?.width ?? 1,

    height:
      textDraft?.height ?? 1,

    text:
      draftText || "Text",

    fontSize,

    fontFamily,

    fontWeight,

    textAlign,

    color:
      textColor,

    opacity:
      textOpacity,
  };

  // ==================================================
  // RENDER
  // ==================================================

  useEffect(() => {
    return () => {
      collaborationSocketRef.current?.disconnect();
      collaborationSocketRef.current = null;
    };
  }, []);

  if (authChecking) {
    return (
      <main className="aegis-auth-loading">
        <div className="aegis-auth-loading-card">
          <div className="aegis-auth-loading-logo">
            A
          </div>

          <div className="aegis-auth-loading-title">
            AEGIS
          </div>

          <div className="aegis-auth-loading-text">
            Checking your session...
          </div>
        </div>
      </main>
    );
  }

if (!authUser) {
  return (
    <LoginScreen
      onLogin={handleAuthChange}
    />
  );
}

if (authUser.must_change_password) {
  return (
    <FirstLoginScreen
      user={authUser}
      onComplete={handleAuthChange}
    />
  );
}

return (
  <div className="aegis-app">
      <AuthUI
        onAuthChange={
          handleAuthChange
        }
      />

      {/* MENU */}

      <button
        type="button"
        className="menu-trigger"
        onClick={() =>
          setMenuOpen(
            (
              value,
            ) => !value,
          )
        }
        title="Main menu"
      >
        <Icon
          name="menu"
          size={22}
        />
      </button>

      {/* TOOLBAR */}

      <TopToolbar
        tool={tool}

        locked={
          locked
        }

        penPressureEnabled={
          penPressureEnabled
        }

        onLockToggle={() => {
  if (
    collaborationPermissionRef.current ===
    "read"
  ) {
    return;
  }

  setLocked(
    (value) => !value,
  );
}}

        onToolChange={
          changeTool
        }

        onPenPressureToggle={() =>
          setPenPressureEnabled(
            (
              value,
            ) => !value,
          )
        }

        onUndo={undo}

        onRedo={redo}

        canUndo={
          past.length >
          0
        }

        canRedo={
          future.length >
          0
        }

        onMore={() =>
          setMoreOpen(
            (
              value,
            ) => !value,
          )
        }
      />

      {/* MENU */}

      <ToolMenu
        open={
          menuOpen
        }

        onClose={() =>
          setMenuOpen(
            false,
          )
        }

        onReset={
          resetCanvas
        }

        onExport={
          exportImage
        }

      onSave={
  saveBoardImage
}



onLiveCollaboration={() => {
  if (authUser?.role === "admin") {
    setCollaborationOpen(true);
    return;
  }

  setEmployeeCollaborationOpen(true);
}}
        onOpenFiles={
          handleOpenFiles
        }

        
      />


 {collaborationOpen && (
  <CollaborationManagement
    onClose={() => {
      setCollaborationOpen(false);
    }}
    elements={elements}
    pan={pan}
    onStarted={(session) => {
      connectCollaboration(session.id);
    }}
    onEnded={() => {
      exitCollaboration();
      setCollaborationOpen(false);
    }}
  />
)}
{employeeCollaborationOpen && (
  <EmployeeCollaboration
  onClose={() =>
    setEmployeeCollaborationOpen(false)
  }
  onJoined={(
    session,
  ) => {
    if (
      !session.board ||
      !session.permission
    ) {
      return;
    }

    enterCollaboration(
      session.board,
      session.permission,
    );

    connectCollaboration(session.id);
    setEmployeeCollaborationOpen(false);
  }}
/>
)}
      {/* MORE */}

      <MoreToolsMenu
        open={
          moreOpen
        }

        onClose={() =>
          setMoreOpen(
            false,
          )
        }
      />

      {/* TEXT PROPERTIES */}

      {tool === "text" &&
        !selectedText && (
          <TextPropertiesPanel
            text={
              draftTextElement
            }
            onChange={
              handleDraftTextChange
            }
          />
        )}

      {/* SELECTED TEXT */}

      {selectedText && (
        <TextPropertiesPanel
          text={
            selectedText
          }
          onChange={
            updateSelectedElement
          }
          onDelete={
            deleteSelected
          }
        />
      )}

      {/* SELECTED SHAPE */}

      {selectedShape && (
        <ShapePropertiesPanel
          shape={
            selectedShape
          }
          onChange={
            updateSelectedElement
          }
          onDelete={
            deleteSelected
          }
        />
      )}

      {/* SELECTED PEN */}

      {selectedElement &&
        selectedElement.type ===
          "freehand" && (
          <PropertiesPanel
            element={
              selectedElement
            }
            onChange={
              updateSelectedElement
            }
            onDelete={
              deleteSelected
            }
          />
        )}

      {/* PEN PROPERTIES */}

      {!selectedElement &&
        tool === "draw" && (
          <PropertiesPanel
            tool="draw"

            penStroke={
              penStroke
            }

            setPenStroke={
              setPenStroke
            }

            penStrokeWidth={
              penStrokeWidth
            }

            setPenStrokeWidth={
              setPenStrokeWidth
            }

            penOpacity={
              penOpacity
            }

            setPenOpacity={
              setPenOpacity
            }
          />
        )}

      {/* SHAPE PROPERTIES */}

      {isShapeTool(tool) &&
        !selectedElement && (
          <ShapePropertiesPanel
            shape={makeShape(
              tool,
              {
                x: 0,
                y: 0,
                pressure:
                  0.5,
              },
              {
                x: 1,
                y: 1,
                pressure:
                  0.5,
              },
            )}
            onChange={
              handleDraftShapeChange
            }
            onDelete={() =>
              undefined
            }
          />
        )}

        {pdfPicker && (
  <div className="pdf-picker-backdrop">
    <div className="pdf-picker">
      <div className="pdf-picker-header">
        <div>
          <div className="pdf-picker-title">
            PDF Page
          </div>

          <div className="pdf-picker-name">
            {pdfPicker.name}
          </div>
        </div>

        <button
          type="button"
          className="pdf-picker-close"
          onClick={() =>
            setPdfPicker(null)
          }
        >
          ×
        </button>
      </div>

      <div className="pdf-picker-content">
        <div className="pdf-picker-count">
          {pdfPicker.totalPages} pages
        </div>

        <label className="pdf-picker-label">
          Page number
        </label>

        <div className="pdf-picker-page-row">
          <button
            type="button"
            className="pdf-picker-arrow"
            disabled={
              pdfPicker.pageNumber <= 1 ||
              pdfLoading
            }
            onClick={() =>
              setPdfPicker(
                (current) =>
                  current
                    ? {
                        ...current,
                        pageNumber:
                          Math.max(
                            1,
                            current.pageNumber -
                              1,
                          ),
                      }
                    : current,
              )
            }
          >
            −
          </button>

          <input
            type="number"
            min={1}
            max={
              pdfPicker.totalPages
            }
            value={
              pdfPicker.pageNumber
            }
            disabled={
              pdfLoading
            }
            onChange={(event) => {
              const value =
                Number(
                  event.target.value,
                );

              setPdfPicker(
                (current) =>
                  current
                    ? {
                        ...current,

                        pageNumber:
                          Number.isFinite(
                            value,
                          )
                            ? Math.min(
                                current.totalPages,
                                Math.max(
                                  1,
                                  value,
                                ),
                              )
                            : 1,
                      }
                    : current,
              );
            }}
          />

          <button
            type="button"
            className="pdf-picker-arrow"
            disabled={
              pdfPicker.pageNumber >=
                pdfPicker.totalPages ||
              pdfLoading
            }
            onClick={() =>
              setPdfPicker(
                (current) =>
                  current
                    ? {
                        ...current,
                        pageNumber:
                          Math.min(
                            current.totalPages,
                            current.pageNumber +
                              1,
                          ),
                      }
                    : current,
              )
            }
          >
            +
          </button>
        </div>

        <div className="pdf-picker-hint">
          Choose a page to place on
          the Aegis Board.
        </div>

        <button
          type="button"
          className="pdf-picker-add"
          disabled={
            pdfLoading
          }
          onClick={
            addSelectedPdfPage
          }
        >
          {pdfLoading
            ? "Rendering page..."
            : `Add Page ${pdfPicker.pageNumber}`}
        </button>
      </div>
    </div>
  </div>
)}

      {/* CANVAS */}

      <canvas
        ref={
          canvasRef
        }

        className={
          tool ===
          "hand"
            ? "aegis-canvas hand-mode"
            : tool ===
                "draw"
              ? "aegis-canvas draw-mode"
              : tool ===
                  "text"
                ? "aegis-canvas text-mode"
                : isShapeTool(
                      tool,
                    )
                  ? "aegis-canvas shape-mode"
                  : "aegis-canvas"
        }

        onContextMenu={
          handleContextMenu
        }

        onPointerDown={
          handlePointerDown
        }
        onDoubleClick={
          handleDoubleClick
        }

        onPointerMove={
          handlePointerMove
        }

        onPointerUp={
          handlePointerUp
        }

        onPointerCancel={
          handlePointerUp
        }
      />
            

      {collaborationMode && (
        <div className="aegis-collaboration-bar">
          <div className="aegis-collaboration-info">
            <strong>Live Collaboration</strong>

            <span>
              {collaborationPermissionRef.current ===
              "read"
                ? "READ ONLY"
                : "READ + WRITE"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              void leaveCollaboration();
            }}
          >
            Leave Collaboration
          </button>
        </div>
      )}
      
      {/* TEXT DRAG PREVIEW */}

      {/* TEXT DRAG PREVIEW */}

      {textDragRect && (
        <div
          className="aegis-text-drag-preview"

          style={{
            left:
              textDragRect.x +
              pan.x,

            top:
              textDragRect.y +
              pan.y,

            width:
              textDragRect.width,

            height:
              textDragRect.height,
          }}
        />
      )}

      {/* TEXT EDITOR */}

      {textDraft && (
        <textarea
          ref={
            textAreaRef
          }

          className="aegis-text-editor"

          value={
            draftText
          }

          onChange={(event) => {
            setDraftText(event.target.value);
            resizeTextEditor(event.target);
          }}

          /*
           * Never let the textarea click reach
           * the canvas.
           */

          onPointerDown={(
            event,
          ) => {
            event.stopPropagation();
          }}

          onKeyDown={(
            event,
          ) => {
            /*
             * ESC = CANCEL
             */

            if (
              event.key ===
              "Escape"
            ) {
              event.preventDefault();

              editingTextIdRef.current =
                null;

              textDraftRef.current =
                null;

              selectedIdRef.current =
                null;

              setSelectedId(
                null,
              );

              setTextDraft(
                null,
              );

              setTool("select");

              setTextDragRect(
                null,
              );

              setDraftText(
                "",
              );

              return;
            }

            /*
             * CTRL + ENTER = FINISH
             */

            if (
              event.key ===
                "Enter" &&
              event.ctrlKey
            ) {
              event.preventDefault();

              finishTextEditing();
            }
          }}

          style={{
            left:
              textDraft.x +
              pan.x,

            top:
              textDraft.y +
              pan.y,

            width:
              textDraft.width,

            minWidth:
              textDraft.width,

            maxWidth:
              textDraft.width,

            height:
              textDraft.height,

            minHeight:
              textDraft.height,

            resize:
              "none",

            borderRadius:
              "9px",

            boxSizing:
              "border-box",

            overflow:
              "hidden",

            fontSize:
              `${fontSize}px`,

            fontFamily,

            fontWeight,

            color:
              textColor,

            opacity:
              textOpacity,

            textAlign,
          }}


          autoFocus
        />
      )}
    </div>
  );
}

export default App;