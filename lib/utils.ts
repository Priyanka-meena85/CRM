export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function isBirthdayToday(birthday: Date | string | null): boolean {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
}

export function isBirthdayTomorrow(birthday: Date | string | null): boolean {
  if (!birthday) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const bday = new Date(birthday);
  return tomorrow.getMonth() === bday.getMonth() && tomorrow.getDate() === bday.getDate();
}

export function isInactive(lastVisit: Date | string | null): boolean {
  if (!lastVisit) return true;
  const diff = Date.now() - new Date(lastVisit).getTime();
  return diff > 90 * 24 * 60 * 60 * 1000;
}
