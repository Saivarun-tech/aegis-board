export type ImportedMedia = {
  src: string;
  width: number;
  height: number;
  name: string;
  sourceType: "image" | "pdf";
  pageNumber?: number;
  totalPages?: number;
};

const fileToDataUrl = (
  file: File,
): Promise<string> => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result ===
          "string"
        ) {
          resolve(reader.result);
        } else {
          reject(
            new Error(
              "Could not read file.",
            ),
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Could not read file.",
          ),
        );
      };

      reader.readAsDataURL(file);
    },
  );
};

const loadImage = (
  src: string,
): Promise<HTMLImageElement> => {
  return new Promise(
    (resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(
          new Error(
            "Could not load image.",
          ),
        );
      };

      image.src = src;
    },
  );
};

/*
 * IMAGE
 */
const importImageFile = async (
  file: File,
): Promise<ImportedMedia> => {
  const src =
    await fileToDataUrl(file);

  const image =
    await loadImage(src);

  const width =
    image.naturalWidth ||
    image.width;

  const height =
    image.naturalHeight ||
    image.height;

  return {
    src,
    width,
    height,
    name:
      file.name,
    sourceType:
      "image",
  };
};

/*
 * NORMAL MEDIA IMPORT
 */
export const importMediaFile = async (
  file: File,
): Promise<ImportedMedia[]> => {
  if (
    file.type.startsWith("image/")
  ) {
    return [
      await importImageFile(file),
    ];
  }

  if (
    file.type ===
      "application/pdf" ||
    file.name
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    /*
     * PDF handling is done through
     * inspectPdfFile() + importPdfPage().
     */
    return [];
  }

  throw new Error(
    `Unsupported file type: ${file.name}`,
  );
};