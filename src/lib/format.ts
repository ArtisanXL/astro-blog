/** Tarih ve okuma süresi yardımcıları (Türkçe). */

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const MONTHS_LONG = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function formatDate(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${String(dt.getDate()).padStart(2, "0")} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateLong(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getDate()} ${MONTHS_LONG[dt.getMonth()]} ${dt.getFullYear()}`;
}
