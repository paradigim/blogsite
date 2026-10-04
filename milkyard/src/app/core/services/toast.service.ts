import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info' | 'error';
  action?: { label: string; link: string };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private n = 0;

  show(title: string, opts: Partial<Omit<Toast, 'id' | 'title'>> = {}, ms = 3800) {
    const t: Toast = { id: ++this.n, title, tone: 'success', ...opts };
    this.toasts.update((l) => [...l.slice(-2), t]);
    setTimeout(() => this.dismiss(t.id), ms);
  }
  error(title: string, body?: string) {
    this.show(title, { tone: 'error', body }, 5000);
  }
  info(title: string, body?: string, ms = 4500) {
    this.show(title, { tone: 'info', body }, ms);
  }
  dismiss(id: number) {
    this.toasts.update((l) => l.filter((t) => t.id !== id));
  }
}
