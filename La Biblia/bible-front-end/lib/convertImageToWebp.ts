export async function convertImageFileToWebpDataUrl(file: File, quality = 0.86) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo convertir la imagen.");

    context.drawImage(image, 0, 0);
    const webpDataUrl = canvas.toDataURL("image/webp", quality);
    if (!webpDataUrl.startsWith("data:image/")) {
      throw new Error("No se pudo convertir la imagen a WebP.");
    }
    return webpDataUrl;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
