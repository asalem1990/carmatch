import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {
  constructor(private http: Http) { }
  search(id: string = "") {
    return this.http.get('assets/slots.json').map((response) => response.json().filter(
        item => id == "" ? item.id != id : item.id == id
      )).toPromise();
  }
}
