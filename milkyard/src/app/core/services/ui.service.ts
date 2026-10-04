import { Injectable, signal } from '@angular/core';

/** Global UI state: drawers, overlays and the quick-view modal. */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly cartOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly quickViewId = signal<string | null>(null);

  closeAll() {
    this.cartOpen.set(false);
    this.searchOpen.set(false);
    this.menuOpen.set(false);
    this.quickViewId.set(null);
  }
}
