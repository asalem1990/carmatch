import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {
  appointments = [];

  constructor(private http: Http, public datepipe: DatePipe) {
    this.search().then((result) => {
      for (let appointment of result) {

        //Date format should follow this format YYYY-MM-DD so that it'd be easier to connect the calendar with the appointments
        // USING THE DATE AS A KEY
        var appointmentDate:any = new Date(appointment.startTime);
        appointmentDate = this.datepipe.transform(appointmentDate, 'yyyy-MM-dd');
        var appointmentTime:any = new Date(appointment.startTime);
        appointmentTime =   appointmentTime.getHours();

        // BUILDING THE ARRAY, THE ARRAY CONTAINS THE APPOINTMENTS GROUPED BY THE HOUR, GROUPD AGAIN BY THE DATE SO THAT IT'D BE EASIER TO ACCESS THEM AND READ THEM.
        if ( this.appointments[appointmentDate] ) {
          if ( this.appointments[appointmentDate][appointmentTime] ) {
            this.appointments[appointmentDate][appointmentTime].push(appointment);
          } else {
            this.appointments[appointmentDate][appointmentTime] = [];
            this.appointments[appointmentDate][appointmentTime].push(appointment);
          }
        } else {
          this.appointments[appointmentDate] = [];
          this.appointments[appointmentDate][appointmentTime] = [];
          this.appointments[appointmentDate][appointmentTime].push(appointment);
        }
      }
    });
  }

  search(id: string = "") {
    return this.http.get('assets/slots.json').map((response) => response.json().filter(
        item => id == "" ? item.id != id : item.id == id
      )).toPromise();
  }


  // CHECK IF A GIVEN TIME SLOT FOR A PARTICULAR DATE IS AVAILABLE.
  hasAppointments (date, hour) {
    if ( this.appointments[date] && this.appointments[date][hour]) {
      return true;
    }
    return false;
  }

  // GET ALL THE APPOINTMENTS FOR A PARTICULAR DATE AND TIME
  getAppointments (date, hour) {
    return this.appointments[date][hour];
  }

}
