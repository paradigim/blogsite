import { Injectable } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  constructor() {}

  getTime(date) {
    return date.getSeconds();
  }

  postDateFormat(date: number) {
    return format(new Date(date), 'dd MMM, yyyy');
  }

  formatByPattern(date: Date | number, formatPattern: string) {
    return format(date, formatPattern);
  }
}
