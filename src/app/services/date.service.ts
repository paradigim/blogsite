import { Injectable } from '@angular/core';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  getTime(date) {
    return date.getSeconds();
  }

  postDateFormat(date: number): string {
    return format(new Date(date), 'dd MMM, yyyy');
  }
}
