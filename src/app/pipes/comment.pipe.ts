import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comment'
})
export class CommentPipe implements PipeTransform {

  transform(value: Comment[], postId: number) {
    const filterComment = value.filter(item => item['postId'] === postId )
    return filterComment;
  }

}
