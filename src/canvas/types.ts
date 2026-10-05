export type Tool =
  | "select"
  | "hand"
  | "draw"
  | "text"
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "note"
  | "eraser";

export type Point = {
  x: number;
  y: number;
  pressure: number;
};

export type TextAlign =
  | "left"
  | "center"
  | "right";

export type FillStyle =
  | "none"
  | "solid"
  | "hachure"
  | "cross-hatch";

export type StrokeStyle =
  | "solid"
  | "dashed"
  | "dotted";

export type FreehandElement = {
  id: string;
  type: "freehand";
  points: Point[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  pressureEnabled: boolean;
};

export type TextElement = {
  id: string;
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  textAlign: TextAlign;
  color: string;
  opacity: number;
};

export type ShapeType =
  | "rectangle"
  | "diamond"
  | "ellipse"
  | "line"
  | "arrow"
  | "note";

export type ShapeElement = {
  id: string;
  type: "shape";
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  background: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  roughness: number;
  noteText?: string;
};

export type ImageElement = {
  id: string;
  type: "image";

  x: number;
  y: number;

  width: number;
  height: number;

  src: string;
  name: string;

  opacity: number;

  sourceType: "image" | "pdf";

  pageNumber?: number;
  totalPages?: number;
};

export type AegisElement =
  | FreehandElement
  | TextElement
  | ShapeElement
  | ImageElement;