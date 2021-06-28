import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  environment = environment;

  constructor(
    private apiService: ApiService
  ) { }

  uploadImage(formData, imageUpload) {
    const url = `${this.environment.api.baseUrl}${this.environment.api.update.uploadProfileImage}`;
    return this.apiService.fetchPostUrl(url, formData, imageUpload);
  }

  deleteProfileImage(prevImage): Observable<boolean> {
    const url = `${this.environment.api.baseUrl}${this.environment.api.update.deleteImage}/${prevImage}`;
    return this.apiService.fetchDelete(url);
  }

  getProfileImage(imageName) {
    return `${this.environment.api.baseUrl}${this.environment.api.getProfileInage}/${imageName}`;
  }
}
