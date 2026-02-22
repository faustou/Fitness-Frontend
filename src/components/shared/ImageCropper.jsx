import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import './image-cropper.css';

// Función para crear la imagen recortada
const createCroppedImage = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Tamaño final del avatar (cuadrado)
  const size = 300;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
};

function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setGuardando(true);
    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      // Crear un File a partir del Blob
      const croppedFile = new File([croppedBlob], 'avatar.jpg', {
        type: 'image/jpeg',
      });
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error recortando imagen:', error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="cropper-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="cropper-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="cropper-header">
            <h3>Ajustá tu foto</h3>
            <p>Arrastrá para posicionar y usá el zoom para ajustar</p>
          </div>

          <div className="cropper-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteHandler}
            />
          </div>

          <div className="cropper-controls">
            <label className="zoom-label">
              <span className="zoom-icon-small">🔍</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="zoom-slider"
              />
              <span className="zoom-icon-large">🔍</span>
            </label>
          </div>

          <div className="cropper-actions">
            <button
              type="button"
              className="cropper-btn-cancel"
              onClick={onCancel}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="cropper-btn-confirm"
              onClick={handleConfirm}
              disabled={guardando}
            >
              {guardando ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImageCropper;
