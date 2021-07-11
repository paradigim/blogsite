import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    return format(new Date(String(value)), 'dd MMM, yyyy');
  }

}
