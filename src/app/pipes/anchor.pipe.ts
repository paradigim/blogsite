import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'anchor'
})
export class AnchorPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  transform(value: string, ...args: unknown[]): SafeHtml {
    const urlRegex = /(https?:\/\/[^ ]*)/;
    const url = value.match(urlRegex);
    
    if (url && url.length > 0) {
      const newValue = value.replace(url[0], '');
      const returnValue = newValue + `<a href="${url[0]}">${url[0]}</a>`;
      return this.sanitizer.bypassSecurityTrustHtml(returnValue);
    }
    return value;
  }

}
