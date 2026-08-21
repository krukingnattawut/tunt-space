"use client";

// Compress + resize an image file in the browser, return a base64 data URL.
// Since this app doesn't use external file storage yet, images are stored
// directly as data URLs in the database — keep them small!
export function fileToCompressedDataUrl(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("ไฟล์ที่เลือกไม่ใช่รูปภาพ"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("ไฟล์รูปใหญ่เกินไป (จำกัด 8MB)"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}
