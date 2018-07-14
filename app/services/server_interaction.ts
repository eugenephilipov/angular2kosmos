import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
//import { Observable } from 'rxjs';
// Promise Version
import { Headers, RequestOptions } from '@angular/http';
import { server_return }           from './server_return';
import { server_send_player }           from './server_send_player';

@Injectable()
export class server_interaction {
server_url:string;
  constructor(private http: Http) {
    this.server_url='http://localhost:8080/echo';
    //this.server_url='http://169.254.102.84:8080/echo';
  }
/*
  search(): Observable<server_return[]> {
    return this.http
               .get(`http://localhost:8080`)
               .map((r: Response) => r.json().data as server_return[]);
  }
*/ 
  getHeroes (): Promise<server_return[]> {
    return this.http.get(this.server_url)
                    .toPromise()
                    .then(this.extractData)
                    .catch(this.handleError);
  }

  informStatus (server_send_player:server_send_player): Promise<server_send_player> {
    let body = JSON.stringify({ server_send_player });
    let headers = new Headers();//new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.server_url, body, options)
               .toPromise()
               .then(this.extractData)
               .catch(this.handleError);
  }

private extractData(res: Response) {
    let body = res.json();
    //console.log(JS);
    return body.data || {};
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Promise.reject(errMsg);
  }

}