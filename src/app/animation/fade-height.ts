import { animate, style, transition, trigger } from '@angular/animations';

export let fadeHeight = trigger('fadeHeight', [
    transition('* => void', [
      animate(150, style({ height: 0, padding: 0, display: 'none' }))
    ])
])