export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Firefox ต้องให้ anchor อยู่ใน DOM จริง และห้าม revoke ทันที ไม่งั้นดาวน์โหลดอาจไม่เริ่ม
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
