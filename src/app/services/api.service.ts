import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  // call post apis
  fetchPostUrl(
    url, 
    data = null, 
    imageUpload = false
  ): Observable<any> {
    if (imageUpload) {
      return this.http.post(url, data, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        map(event => event)
      )
    }
    return this.http.post(url, data);
  }

  fetchGetUrl(url): Observable<any> {
    return this.http.get(url);
  }

  fetchDelete(url): Observable<any> {
    return this.http.delete(url);
  }

}
