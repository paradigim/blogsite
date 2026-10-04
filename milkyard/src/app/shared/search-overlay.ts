import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../core/services/catalog.service';
import { UiService } from '../core/services/ui.service';
import { Icon } from './icon';
import { InrPipe } from './inr.pipe';

@Component({
  selector: 'app-search-overlay',
  imports: [RouterLink, Icon, InrPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .panel { position: fixed; z-index: 96; top: 0; left: 0; right: 0; background: var(--cream); padding: 20px 0 28px; box-shadow: var(--shadow-lg); animation: drop .4s var(--ease); border-radius: 0 0 28px 28px; max-height: 100dvh; overflow: auto; }
    @keyframes drop { from { transform: translateY(-30px); opacity: 0; } }
    form { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid var(--ink); padding-bottom: 10px; }
    input { flex: 1; border: 0; background: none; font: inherit; font-family: var(--font-display); font-size: clamp(1.4rem, 4vw, 2.2rem); min-width: 0; }
    input:focus { outline: none; }
    .sugg { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    .res { margin-top: 18px; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
    .item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 16px; background: #fff; border: 1px solid var(--line); transition: border-color .2s; }
    .item:hover { border-color: var(--ink); }
    .item img { width: 56px; height: 56px; border-radius: 12px; }
    .item b { display: block; font-size: .92rem; }
    .item span { font-size: .8rem; color: var(--muted); font-weight: 700; }
    h6 { margin: 18px 0 0; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  `,
  template: `
    @if (ui.searchOpen()) {
      <div class="backdrop" (click)="ui.searchOpen.set(false)"></div>
      <div class="panel" role="dialog" aria-modal="true" aria-label="Search products">
        <div class="container">
          <form (submit)="$event.preventDefault(); go()">
            <app-icon name="search" [size]="26" />
            <input #box [value]="q()" (input)="q.set(box.value)" placeholder="Search ghee, kheer, laddu…" aria-label="Search products" autocomplete="off" />
            <button type="button" class="icon-btn" (click)="ui.searchOpen.set(false)" aria-label="Close search"><app-icon name="close" /></button>
          </form>
          @if (!q()) {
            <h6>Popular searches</h6>
            <div class="sugg">
              @for (s of popular; track s) { <button class="chip" (click)="q.set(s)">{{ s }}</button> }
            </div>
          } @else {
            <h6>{{ results().length }} result{{ results().length === 1 ? '' : 's' }} for “{{ q() }}”</h6>
            <div class="res">
              @for (p of results().slice(0, 8); track p.id) {
                <a class="item" [routerLink]="['/product', p.slug]" (click)="ui.searchOpen.set(false)">
                  <img [src]="p.images[0]" alt="" />
                  <div><b>{{ p.name }}</b><span>from {{ catalog.minPrice(p) | inr }} · {{ catalog.primaryCategory(p)?.name }}</span></div>
                </a>
              }
            </div>
            @if (results().length) { <button class="btn btn-sm mt-2" (click)="go()">See all results <app-icon name="arrow-right" [size]="16" /></button> }
            @else { <p class="muted mt-2">No matches. Try “ghee”, “laddu” or “dry fruits”.</p> }
          }
        </div>
      </div>
    }
  `,
})
export class SearchOverlay {
  protected ui = inject(UiService);
  protected catalog = inject(CatalogService);
  private router = inject(Router);
  protected q = signal('');
  protected results = computed(() => this.catalog.search(this.q()));
  protected popular = ['Ghee', 'Kheer malai', 'Laddu', 'Makkhan', 'Mishti doi', 'Dry fruits', 'Gift box'];
  private box = viewChild<ElementRef<HTMLInputElement>>('box');

  constructor() {
    effect(() => {
      const el = this.box();
      if (el) setTimeout(() => el.nativeElement.focus(), 50);
    });
  }

  go() {
    if (!this.q().trim()) return;
    this.ui.searchOpen.set(false);
    this.router.navigate(['/search'], { queryParams: { q: this.q().trim() } });
  }
}
