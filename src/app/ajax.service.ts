import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {catchError} from "rxjs/operators";

@Injectable()
export class AjaxService {

    constructor(private http: HttpClient) {
    }

    public getData(url: string): Observable<string[]> {
        return this.http.get<string[]>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    public putData(url: string, data): Observable<any>{
      return this.http.put<string[]>(url, data)
        .pipe(
          catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        const errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
