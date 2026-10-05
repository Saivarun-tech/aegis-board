import type {
  AegisElement,
  FreehandElement,
  ImageElement,
  ShapeElement,
  TextElement,
} from "./types";

/* =========================================================
   HELPERS
========================================================= */

const clamp = (
  value: number,
  min: number,
  max: number,
) =>
  Math.max(
    min,
    Math.min(max, value),
  );

/* =========================================================
   IMAGE CACHE
========================================================= */

const imageCache =
  new Map<string, HTMLImageElement>();

const imageLoading =
  new Map<
    string,
    Promise<HTMLImageElement>
  >();

const loadCanvasImage = (
  src: string,
): Promise<HTMLImageElement> => {
  const cached =
    imageCache.get(src);

  if (cached) {
    return Promise.resolve(
      cached,
    );
  }

  const existing =
    imageLoading.get(src);

  if (existing) {
    return existing;
  }

  const promise =
    new Promise<HTMLImageElement>(
      (
        resolve,
        reject,
      ) => {
        const image =
          new Image();

        image.onload = () => {
          imageCache.set(
            src,
            image,
          );

          imageLoading.delete(
            src,
          );

          resolve(image);
        };

        image.onerror = () => {
          imageLoading.delete(
            src,
          );

          reject(
            new Error(
              "Failed to load image.",
            ),
          );
        };

        image.src = src;
      },
    );

  imageLoading.set(
    src,
    promise,
  );

  return promise;
};

/* =========================================================
   ROUNDED RECTANGLE
========================================================= */

const roundRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r =
    Math.min(
      radius,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
    );

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y,
  );

  ctx.lineTo(
    x + width - r,
    y,
  );

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r,
  );

  ctx.lineTo(
    x + width,
    y +
      height -
      r,
  );

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x +
      width -
      r,
    y + height,
  );

  ctx.lineTo(
    x + r,
    y + height,
  );

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y +
      height -
      r,
  );

  ctx.lineTo(
    x,
    y + r,
  );

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y,
  );

  ctx.closePath();
};

/* =========================================================
   SELECTION
========================================================= */

const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  ctx.save();

  ctx.strokeStyle =
    "#2563eb";

  ctx.lineWidth = 1.5;

  ctx.setLineDash([
    5,
    4,
  ]);

  ctx.strokeRect(
    x - 4,
    y - 4,
    width + 8,
    height + 8,
  );

  ctx.setLineDash([]);

  const size = 7;

  const handles = [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height],
  ];

  ctx.fillStyle =
    "#ffffff";

  ctx.strokeStyle =
    "#2563eb";

  handles.forEach(
    ([hx, hy]) => {
      ctx.beginPath();

      ctx.rect(
        hx -
          size / 2,
        hy -
          size / 2,
        size,
        size,
      );

      ctx.fill();
      ctx.stroke();
    },
  );

  ctx.restore();
};

/* =========================================================
   IMAGE
========================================================= */

const drawImage = (
  ctx: CanvasRenderingContext2D,
  element: ImageElement,
  selected: boolean,
) => {
  const image =
    imageCache.get(
      element.src,
    );

  if (!image) {
    void loadCanvasImage(
      element.src,
    ).catch(() => {
      // Image loading failure is handled visually below.
    });

    ctx.save();

    ctx.globalAlpha =
      element.opacity;

    ctx.fillStyle =
      "#f3f4f6";

    ctx.fillRect(
      element.x,
      element.y,
      element.width,
      element.height,
    );

    ctx.strokeStyle =
      "#d1d5db";

    ctx.lineWidth = 1;

    ctx.strokeRect(
      element.x,
      element.y,
      element.width,
      element.height,
    );

    ctx.fillStyle =
      "#6b7280";

    ctx.font =
      "14px Inter, Arial, sans-serif";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      "Loading...",
      element.x +
        element.width / 2,
      element.y +
        element.height / 2,
    );

    ctx.restore();

    return;
  }

  ctx.save();

  ctx.globalAlpha =
    clamp(
      element.opacity,
      0,
      1,
    );

  ctx.drawImage(
    image,
    element.x,
    element.y,
    element.width,
    element.height,
  );

  ctx.globalAlpha =
    1;

  ctx.strokeStyle =
    "rgba(0, 0, 0, 0.12)";

  ctx.lineWidth = 1;

  ctx.strokeRect(
    element.x,
    element.y,
    element.width,
    element.height,
  );

  ctx.restore();

  if (selected) {
    drawSelectionBox(
      ctx,
      element.x,
      element.y,
      element.width,
      element.height,
    );
  }
};

/* =========================================================
   FREEHAND
========================================================= */

const drawFreehand = (
  ctx: CanvasRenderingContext2D,
  element: FreehandElement,
  selected: boolean,
) => {
  if (
    element.points.length ===
    0
  ) {
    return;
  }

  ctx.save();

  ctx.globalAlpha =
    clamp(
      element.opacity,
      0,
      1,
    );

  ctx.strokeStyle =
    element.stroke;

  ctx.fillStyle =
    element.stroke;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /*
   * Single point.
   */
  if (
    element.points.length ===
    1
  ) {
    const point =
      element.points[0];

    const pressure =
      element.pressureEnabled
        ? clamp(
            point.pressure ||
              0.5,
            0.1,
            1,
          )
        : 1;

    const radius =
      Math.max(
        0.5,
        (element.strokeWidth *
          pressure) /
          2,
      );

    ctx.beginPath();

    ctx.arc(
      point.x,
      point.y,
      radius,
      0,
      Math.PI * 2,
    );

    ctx.fill();

    ctx.restore();

    return;
  }

  /*
   * Pressure-sensitive
   * segments.
   */
  for (
    let i = 1;
    i <
    element.points.length;
    i += 1
  ) {
    const previous =
      element.points[i - 1];

    const current =
      element.points[i];

    const pressure =
      element.pressureEnabled
        ? clamp(
            current.pressure ||
              0.5,
            0.1,
            1,
          )
        : 1;

    ctx.lineWidth =
      Math.max(
        0.5,
        element.strokeWidth *
          pressure,
      );

    ctx.beginPath();

    ctx.moveTo(
      previous.x,
      previous.y,
    );

    ctx.lineTo(
      current.x,
      current.y,
    );

    ctx.stroke();
  }

  ctx.restore();

  if (selected) {
    const bounds =
      getElementBounds(
        ctx,
        element,
      );

    drawSelectionBox(
      ctx,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
  }
};

/* =========================================================
   TEXT
========================================================= */

const drawText = (
  ctx: CanvasRenderingContext2D,
  element: TextElement,
  selected: boolean,
) => {
  ctx.save();

  ctx.globalAlpha =
    clamp(
      element.opacity,
      0,
      1,
    );

  ctx.fillStyle =
    element.color;

  ctx.font =
    `${element.fontWeight} ${element.fontSize}px "${element.fontFamily}"`;

  ctx.textBaseline =
    "top";

  ctx.textAlign =
    element.textAlign;

  let drawX =
    element.x;

  if (
    element.textAlign ===
    "center"
  ) {
    drawX =
      element.x +
      element.width / 2;
  }

  if (
    element.textAlign ===
    "right"
  ) {
    drawX =
      element.x +
      element.width;
  }

  const lines =
    element.text.split(
      "\n",
    );

  const lineHeight =
    element.fontSize *
    1.25;

  lines.forEach(
    (
      line,
      index,
    ) => {
      ctx.fillText(
        line,
        drawX,
        element.y +
          index *
            lineHeight,
      );
    },
  );

  ctx.restore();

  if (selected) {
    drawSelectionBox(
      ctx,
      element.x,
      element.y,
      element.width,
      Math.max(
        element.height,
        lines.length *
          lineHeight,
      ),
    );
  }
};

/* =========================================================
   HACHURE
========================================================= */

const drawHachureFill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  ctx.save();

  ctx.beginPath();

  ctx.rect(
    x,
    y,
    width,
    height,
  );

  ctx.clip();

  ctx.strokeStyle =
    "rgba(0, 0, 0, 0.18)";

  ctx.lineWidth = 1;

  const spacing = 8;

  for (
    let offset =
      -Math.abs(height);
    offset <
    Math.abs(width) +
      Math.abs(height);
    offset += spacing
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x + offset,
      y,
    );

    ctx.lineTo(
      x +
        offset +
        height,
      y + height,
    );

    ctx.stroke();
  }

  ctx.restore();
};

/* =========================================================
   CROSS HATCH
========================================================= */

const drawCrossHatchFill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  drawHachureFill(
    ctx,
    x,
    y,
    width,
    height,
  );

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    x,
    y,
    width,
    height,
  );

  ctx.clip();

  ctx.strokeStyle =
    "rgba(0, 0, 0, 0.16)";

  ctx.lineWidth = 1;

  const spacing = 8;

  for (
    let offset =
      -Math.abs(height);
    offset <
    Math.abs(width) +
      Math.abs(height);
    offset += spacing
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x + offset,
      y + height,
    );

    ctx.lineTo(
      x +
        offset +
        height,
      y,
    );

    ctx.stroke();
  }

  ctx.restore();
};

/* =========================================================
   SHAPE PATH
========================================================= */

const createShapePath = (
  ctx: CanvasRenderingContext2D,
  element: ShapeElement,
) => {
  const x =
    element.x;

  const y =
    element.y;

  const width =
    element.width;

  const height =
    element.height;

  const right =
    x + width;

  const bottom =
    y + height;

  const centerX =
    x + width / 2;

  const centerY =
    y + height / 2;

  if (
    element.shapeType ===
    "rectangle"
  ) {
    roundRectPath(
      ctx,
      x,
      y,
      width,
      height,
      8,
    );

    return;
  }

  if (
    element.shapeType ===
    "note"
  ) {
    roundRectPath(
      ctx,
      x,
      y,
      width,
      height,
      4,
    );

    return;
  }

  if (
    element.shapeType ===
    "diamond"
  ) {
    ctx.beginPath();

    ctx.moveTo(
      centerX,
      y,
    );

    ctx.lineTo(
      right,
      centerY,
    );

    ctx.lineTo(
      centerX,
      bottom,
    );

    ctx.lineTo(
      x,
      centerY,
    );

    ctx.closePath();

    return;
  }

  if (
    element.shapeType ===
    "ellipse"
  ) {
    ctx.beginPath();

    ctx.ellipse(
      centerX,
      centerY,
      Math.abs(width) / 2,
      Math.abs(height) / 2,
      0,
      0,
      Math.PI * 2,
    );
  }
};

/* =========================================================
   LINE
========================================================= */

const drawLine = (
  ctx: CanvasRenderingContext2D,
  element: ShapeElement,
) => {
  ctx.beginPath();

  ctx.moveTo(
    element.x,
    element.y,
  );

  ctx.lineTo(
    element.x +
      element.width,
    element.y +
      element.height,
  );

  ctx.stroke();
};

/* =========================================================
   ARROW HEAD
========================================================= */

const drawArrowHead = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
) => {
  const left =
    angle +
    Math.PI -
    Math.PI / 6;

  const right =
    angle +
    Math.PI +
    Math.PI / 6;

  ctx.beginPath();

  ctx.moveTo(
    x,
    y,
  );

  ctx.lineTo(
    x +
      Math.cos(left) *
        size,
    y +
      Math.sin(left) *
        size,
  );

  ctx.moveTo(
    x,
    y,
  );

  ctx.lineTo(
    x +
      Math.cos(right) *
        size,
    y +
      Math.sin(right) *
        size,
  );

  ctx.stroke();
};

/* =========================================================
   SHAPE
========================================================= */

const drawShape = (
  ctx: CanvasRenderingContext2D,
  element: ShapeElement,
  selected: boolean,
) => {
  ctx.save();

  ctx.globalAlpha =
    clamp(
      element.opacity,
      0,
      1,
    );

  ctx.strokeStyle =
    element.stroke;

  ctx.fillStyle =
    element.background;

  ctx.lineWidth =
    Math.max(
      1,
      element.strokeWidth,
    );

  if (
    element.strokeStyle ===
    "dashed"
  ) {
    ctx.setLineDash([
      10,
      8,
    ]);
  } else if (
    element.strokeStyle ===
    "dotted"
  ) {
    ctx.setLineDash([
      2,
      7,
    ]);
  } else {
    ctx.setLineDash([]);
  }

  /*
   * Line.
   */
  if (
    element.shapeType ===
    "line"
  ) {
    drawLine(
      ctx,
      element,
    );

    ctx.restore();

    if (selected) {
      drawSelectionBox(
        ctx,
        element.x,
        element.y,
        element.width,
        element.height,
      );
    }

    return;
  }

  /*
   * Arrow.
   */
  if (
    element.shapeType ===
    "arrow"
  ) {
    drawLine(
      ctx,
      element,
    );

    const endX =
      element.x +
      element.width;

    const endY =
      element.y +
      element.height;

    const angle =
      Math.atan2(
        element.height,
        element.width,
      );

    drawArrowHead(
      ctx,
      endX,
      endY,
      angle,
      Math.max(
        10,
        element.strokeWidth *
          4,
      ),
    );

    ctx.restore();

    if (selected) {
      drawSelectionBox(
        ctx,
        element.x,
        element.y,
        element.width,
        element.height,
      );
    }

    return;
  }

  /*
   * Closed shape.
   */
  createShapePath(
    ctx,
    element,
  );

  /*
   * Fill.
   */
  if (
    element.fillStyle ===
    "solid"
  ) {
    ctx.fill();
  } else if (
    element.fillStyle ===
    "hachure"
  ) {
    drawHachureFill(
      ctx,
      element.x,
      element.y,
      element.width,
      element.height,
    );
  } else if (
    element.fillStyle ===
    "cross-hatch"
  ) {
    drawCrossHatchFill(
      ctx,
      element.x,
      element.y,
      element.width,
      element.height,
    );
  }

  /*
   * Outline.
   */
  ctx.stroke();

  /*
   * Note text.
   */
  if (
    element.shapeType ===
      "note" &&
    element.noteText
  ) {
    ctx.save();

    ctx.globalAlpha =
      clamp(
        element.opacity,
        0,
        1,
      );

    ctx.fillStyle =
      element.stroke;

    ctx.font =
      "16px Inter, Arial, sans-serif";

    ctx.textAlign =
      "left";

    ctx.textBaseline =
      "top";

    const padding = 12;

    const lines =
      element.noteText.split(
        "\n",
      );

    lines.forEach(
      (
        line,
        index,
      ) => {
        ctx.fillText(
          line,
          element.x +
            padding,
          element.y +
            padding +
            index * 21,
        );
      },
    );

    ctx.restore();
  }

  ctx.restore();

  if (selected) {
    drawSelectionBox(
      ctx,
      element.x,
      element.y,
      element.width,
      element.height,
    );
  }
};

/* =========================================================
   ELEMENT BOUNDS
   IMPORTANT:
   App.tsx already calls:
   getElementBounds(ctx, element)
========================================================= */

export const getElementBounds = (
  _ctx: CanvasRenderingContext2D,
  element: AegisElement,
) => {
  /*
   * Text.
   */
  if (
    element.type ===
    "text"
  ) {
    return {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    };
  }

  /*
   * Image / PDF page.
   */
  if (
    element.type ===
    "image"
  ) {
    return {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    };
  }

  /*
   * Shape.
   */
  if (
    element.type ===
    "shape"
  ) {
    const minX =
      Math.min(
        element.x,
        element.x +
          element.width,
      );

    const minY =
      Math.min(
        element.y,
        element.y +
          element.height,
      );

    const maxX =
      Math.max(
        element.x,
        element.x +
          element.width,
      );

    const maxY =
      Math.max(
        element.y,
        element.y +
          element.height,
      );

    return {
      x: minX,
      y: minY,
      width:
        maxX - minX,
      height:
        maxY - minY,
    };
  }

  /*
   * Freehand.
   */
  if (
    element.points.length ===
    0
  ) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  let minX =
    element.points[0].x;

  let minY =
    element.points[0].y;

  let maxX =
    element.points[0].x;

  let maxY =
    element.points[0].y;

  element.points.forEach(
    (point) => {
      minX = Math.min(
        minX,
        point.x,
      );

      minY = Math.min(
        minY,
        point.y,
      );

      maxX = Math.max(
        maxX,
        point.x,
      );

      maxY = Math.max(
        maxY,
        point.y,
      );
    },
  );

  const padding =
    Math.max(
      4,
      element.strokeWidth,
    );

  return {
    x: minX - padding,
    y: minY - padding,
    width:
      maxX -
      minX +
      padding * 2,
    height:
      maxY -
      minY +
      padding * 2,
  };
};

/* =========================================================
   HIT TEST
========================================================= */

export const isPointInsideElement = (
  ctx: CanvasRenderingContext2D,
  element: AegisElement,
  point: {
    x: number;
    y: number;
  },
) => {
  const bounds =
    getElementBounds(
      ctx,
      element,
    );

  return (
    point.x >= bounds.x &&
    point.x <=
      bounds.x +
        bounds.width &&
    point.y >= bounds.y &&
    point.y <=
      bounds.y +
        bounds.height
  );
};

/* =========================================================
   DRAW ONE ELEMENT
========================================================= */

const drawElement = (
  ctx: CanvasRenderingContext2D,
  element: AegisElement,
  selected: boolean,
) => {
  if (
    element.type ===
    "freehand"
  ) {
    drawFreehand(
      ctx,
      element,
      selected,
    );

    return;
  }

  if (
    element.type ===
    "text"
  ) {
    drawText(
      ctx,
      element,
      selected,
    );

    return;
  }

  if (
    element.type ===
    "image"
  ) {
    drawImage(
      ctx,
      element,
      selected,
    );

    return;
  }

  drawShape(
    ctx,
    element,
    selected,
  );
};

/* =========================================================
   MAIN SCENE RENDERER

   IMPORTANT:
   App.tsx already calls:

   renderScene(
     canvas,
     elements,
     pan.x,
     pan.y,
     selectedId,
     previewElement,
     editingTextId
   )
========================================================= */

export const renderScene = (
  canvas: HTMLCanvasElement,
  elements: AegisElement[],
  panX = 0,
  panY = 0,
  selectedElementId:
    | string
    | null = null,
  previewElement:
    | AegisElement
    | null = null,
  editingTextId:
    | string
    | null = null,
) => {
  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    return;
  }

  /*
   * Reset transform before
   * clearing.
   */
  ctx.setTransform(
    1,
    0,
    0,
    1,
    0,
    0,
  );

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  /*
   * The App uses CSS-sized
   * coordinates while the
   * canvas may have a DPR
   * backing size.
   *
   * Scale according to the
   * canvas's CSS dimensions.
   */
  const rect =
    canvas.getBoundingClientRect();

  const scaleX =
    rect.width > 0
      ? canvas.width /
        rect.width
      : 1;

  const scaleY =
    rect.height > 0
      ? canvas.height /
        rect.height
      : 1;

  ctx.setTransform(
    scaleX,
    0,
    0,
    scaleY,
    0,
    0,
  );

  /*
   * Pan the world.
   */
  ctx.translate(
    panX,
    panY,
  );

  /*
   * Draw stored elements.
   */
  elements.forEach(
    (element) => {
      /*
       * Don't draw the text
       * that is currently being
       * edited behind the HTML
       * textarea.
       */
      if (
        element.type ===
          "text" &&
        element.id ===
          editingTextId
      ) {
        return;
      }

      drawElement(
        ctx,
        element,
        element.id ===
          selectedElementId,
      );
    },
  );

  /*
   * Draw current preview on
   * top of existing elements.
   */
  if (previewElement) {
    drawElement(
      ctx,
      previewElement,
      false,
    );
  }

  ctx.restore?.();
};

/* =========================================================
   PREVIEW RENDERER

   Kept compatible with
   App.tsx:
   renderPreview(element, ctx)
========================================================= */

export const renderPreview = (
  element: AegisElement | null,
  ctx: CanvasRenderingContext2D,
) => {
  if (!element) {
    return;
  }

  drawElement(
    ctx,
    element,
    false,
  );
};

/* =========================================================
   EXPORT CANVAS
========================================================= */

export const renderToCanvas = (
  elements: AegisElement[],
  width: number,
  height: number,
) => {
  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width =
    Math.max(
      1,
      Math.ceil(width),
    );

  canvas.height =
    Math.max(
      1,
      Math.ceil(height),
    );

  const ctx =
    canvas.getContext(
      "2d",
    );

  if (!ctx) {
    throw new Error(
      "Could not create export canvas.",
    );
  }

  elements.forEach(
    (element) => {
      drawElement(
        ctx,
        element,
        false,
      );
    },
  );

  return canvas;
};