// cropImage.js
// Example getCroppedImg function modification
async function getCroppedImg(imageSrc, pixelCrop) {
  // Create an image
  const image = new Image();
  image.src = imageSrc;
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  // Draw the cropped image on the canvas
  ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
          if (!blob) {
              // reject new Error('Canvas is empty');
              console.error('Canvas is empty');
              return;
          }
          blob.name = 'cropped.jpg';
          resolve(blob);
      }, 'image/jpeg');
  });
}


export default getCroppedImg;
