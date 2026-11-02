export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const initials = (n: string) =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const fmtNum = (n: number) => n.toLocaleString('id-ID');

export const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));

export const emailOf = (nim: string) => `${nim}@student.esaunggul.ac.id`;
