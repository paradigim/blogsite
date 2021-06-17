import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  // call post apis
  fetchPostUrl(url, data): Observable<any> {
    return this.http.post(url, data);
  }

  fetchGetUrl(url): Observable<any> {
    const httpHeader = new HttpHeaders({
      'content-type': 'application/json',
    })
    return this.http.get(url, {
      headers: httpHeader
    });
  }


}
