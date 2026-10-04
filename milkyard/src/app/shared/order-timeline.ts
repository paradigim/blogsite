import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Order } from '../core/models';
import { ORDER_FLOW } from '../core/services/order.service';
import { Icon } from './icon';

@Component({
  selector: 'app-order-timeline',
  imports: [DatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ol { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(5, 1fr); position: relative; }
    li { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; position: relative; font-size: .76rem; font-weight: 800; color: var(--muted-2); }
    li::before { content: ''; position: absolute; top: 17px; left: -50%; right: 50%; height: 3px; background: var(--line); z-index: 0; }
    li:first-child::before { display: none; }
    li.done::before { background: var(--ink); }
    .dot { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 2px solid var(--line); position: relative; z-index: 1; }
    li.done { color: var(--ink); }
    li.done .dot { background: var(--ink); color: var(--yellow); border-color: var(--ink); }
    li.current .dot { background: var(--yellow); color: var(--ink); box-shadow: 0 0 0 6px rgba(252,224,3,.35); }
    small { font-weight: 600; color: var(--muted); font-size: .68rem; }
    .halt { display: flex; gap: 10px; align-items: center; padding: 14px; border-radius: 14px; background: var(--danger-soft); color: var(--danger); font-weight: 800; }
    @media (max-width: 520px) { li span.l { font-size: .66rem; } .dot { width: 30px; height: 30px; } li::before { top: 14px; } }
  `,
  template: `
    @if (halted()) {
      <div class="halt"><app-icon name="alert" /> This order was {{ order().status.toLowerCase() }}.</div>
    } @else {
      <ol>
        @for (s of flow; track s; let i = $index) {
          <li [class.done]="i <= idx()" [class.current]="i === idx()">
            <span class="dot"><app-icon [name]="icons[i]" [size]="16" /></span>
            <span class="l">{{ s }}</span>
            @if (at(s); as t) { <small>{{ t | date: 'd MMM, h:mm a' }}</small> }
          </li>
        }
      </ol>
    }
  `,
})
export class OrderTimeline {
  readonly order = input.required<Order>();
  protected flow = ORDER_FLOW;
  protected icons = ['receipt', 'check', 'flame', 'truck', 'home'];
  protected idx = computed(() => ORDER_FLOW.indexOf(this.order().status));
  protected halted = computed(() => ['Cancelled', 'Failed', 'Refunded'].includes(this.order().status));
  at(s: string) {
    return this.order().timeline.find((t) => t.status === s)?.at;
  }
}
