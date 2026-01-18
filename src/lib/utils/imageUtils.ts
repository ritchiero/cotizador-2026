export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const validateImageFile = (file: File): boolean => {
  // Validar el tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('Por favor selecciona un archivo de imagen válido');
  }

  // Validar el tamaño (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen debe ser menor a 5MB');
  }

  return true;
};

// Función para redimensionar y comprimir imagen antes de subir
export const compressImage = (file: File, maxWidth = 400, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a Blob comprimido
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
}; 