/**
 * Generate a unique order number
 * Format: KZ-YYYYMMDD-XXXXXX (e.g., KZ-20250115-A1B2C3)
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `KZ-${year}${month}${day}-${random}`;
}

