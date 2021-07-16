import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CommentStore } from './comment.store';

@Injectable({ providedIn: 'root' })
export class CommentService {

  constructor(private commentStore: CommentStore, private http: HttpClient) {
  }


}
