import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  environment = environment;

  constructor(
    private apiService: ApiService
  ) { }

  createNewPost(data) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.post.createPost}`;
    return this.apiService.fetchPostUrl(url, data);
  }

  getAllPosts() {
    const url = `${this.environment.api.baseUrl}${this.environment.api.post.getAll}`;
    return this.apiService.fetchGetUrl(url);
  }

  getPostImage(imageName: string) {
    return `${this.environment.api.baseUrl}${this.environment.api.post.getPostImage}/${imageName}`;
  }

  getNewPost(postId: number) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.post.getNewPost}/${postId}`;
    return this.apiService.fetchGetUrl(url);
  }
}
