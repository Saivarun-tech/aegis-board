import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";

import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

import type { ImportedMedia } from "./mediaImport";

GlobalWorkerOptions.workerSrc = workerUrl;

/*
 * PDF PAGES
 *
 * PDFs are rendered separately at a higher
 * resolution because their text needs to
 * remain readable when zooming.
 */
const MAX_PDF_WIDTH = 1400;
const MAX_PDF_HEIGHT = 1800;

const fitSize = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) => {
  let nextWidth = width;
  let nextHeight = height;

  if (
    nextWidth <= 0 ||
    nextHeight <= 0
  ) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const widthScale =
    maxWidth / nextWidth;

  const heightScale =
    maxHeight / nextHeight;

  const scale = Math.min(
    1,
    widthScale,
    heightScale,
  );

  nextWidth *= scale;
  nextHeight *= scale;

  return {
    width: Math.max(
      1,
      Math.round(nextWidth),
    ),

    height: Math.max(
      1,
      Math.round(nextHeight),
    ),
  };
};

/*
 * OPEN PDF
 *
 * This only loads the PDF document and reads
 * its page count.
 *
 * It does NOT render all pages.
 */
export const inspectPdfFile = async (
  file: File,
) => {
  const buffer =
    await file.arrayBuffer();

  const loadingTask =
    getDocument({
      data: buffer,
    });

  const pdf =
    await loadingTask.promise;

  return {
    file,
    name: file.name,
    totalPages: pdf.numPages,
  };
};

/*
 * RENDER ONE PDF PAGE
 */
export const importPdfPage = async (
  file: File,
  pageNumber: number,
): Promise<ImportedMedia> => {
  const buffer =
    await file.arrayBuffer();

  const loadingTask =
    getDocument({
      data: buffer,
    });

  const pdf =
    await loadingTask.promise;

  if (
    pageNumber < 1 ||
    pageNumber > pdf.numPages
  ) {
    throw new Error(
      `PDF page ${pageNumber} does not exist.`,
    );
  }

  const page =
    await pdf.getPage(
      pageNumber,
    );

  const baseViewport =
    page.getViewport({
      scale: 1,
    });

  const baseWidth =
    baseViewport.width;

  const baseHeight =
    baseViewport.height;

  /*
   * Render PDF pages at a much higher
   * resolution than before.
   */
  const size = fitSize(
    baseWidth,
    baseHeight,
    MAX_PDF_WIDTH,
    MAX_PDF_HEIGHT,
  );

  const scale =
    size.width /
    baseWidth;

  const viewport =
    page.getViewport({
      scale,
    });

  const canvas =
    document.createElement(
      "canvas",
    );

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    throw new Error(
      `Could not create canvas for PDF page ${pageNumber}.`,
    );
  }

  canvas.width =
    Math.ceil(
      viewport.width,
    );

  canvas.height =
    Math.ceil(
      viewport.height,
    );

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  const src =
    canvas.toDataURL(
      "image/png",
    );

  return {
    src,
    width:
      canvas.width,
    height:
      canvas.height,
    name:
      `${file.name} — Page ${pageNumber}`,
    sourceType:
      "pdf",
    pageNumber,
    totalPages:
      pdf.numPages,
  };
};