export type ToastKind = 'success' | 'error' | 'info';
export function toast(message: string, kind: ToastKind = 'success') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('pemira:toast', { detail: { message, kind } }));
}
