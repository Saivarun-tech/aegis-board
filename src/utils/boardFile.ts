import type { AegisElement } from "../canvas/types";

export const AEGIS_FILE_VERSION = 1;

export type AegisBoardFile = {
  format: "aegis-board";
  version: number;
  createdAt: string;
  updatedAt: string;
  elements: AegisElement[];
  pan: {
    x: number;
    y: number;
  };
};

export const createAegisBoardFile = (
  elements: AegisElement[],
  pan: { x: number; y: number },
): AegisBoardFile => {
  const now = new Date().toISOString();

  return {
    format: "aegis-board",
    version: AEGIS_FILE_VERSION,
    createdAt: now,
    updatedAt: now,
    elements: structuredClone(elements),
    pan: {
      x: pan.x,
      y: pan.y,
    },
  };
};

export const serializeAegisBoard = (
  board: AegisBoardFile,
): string => {
  return JSON.stringify(
    board,
    null,
    2,
  );
};