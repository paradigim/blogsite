
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DataExchangeService } from "../services/data-exchange.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private dataService: DataExchangeService
    ) {}

    intercept(
        req: HttpRequest<any>, 
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('jwt');
        const modifiedReq = req.clone({ 
            headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next.handle(modifiedReq);
    }
}
