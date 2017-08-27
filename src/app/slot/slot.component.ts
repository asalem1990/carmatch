import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../data.service';
import { RealtimeService } from '../realtime.service';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent implements OnInit {
  @Input() day:any;
  @Input() hour:any;

  appointments = [];

  rForm: FormGroup;
  appointment:any;
  name:string = '';
  email:string = '';
  phoneNumber:string = '';

  constructor(public fb: FormBuilder, private data: DataService, public realtime: RealtimeService) {
    data.search().then((result) => {
      this.filterAppointmentList(result);
    });

    // CREATING THE FORM OBJECT WHICH WILL BE USED TO DRAW EACH FORM IN THE calendar
    this.rForm = fb.group({
      'name' : [null,Validators.required],
      'email' : [null,Validators.required],
      'phoneNumber' : [null,Validators.required]
    });
  }

  filterAppointmentList (appointments) {
    for (let appointment of appointments) {
      //Date format should follow this format YYYY-MM-DD so that it'd be easier to connect the calendar with the appointments
      // USING THE DATE AS A KEY
      var appointmentDate:any = new Date(appointment.startTime);
      appointmentDate =   appointmentDate.getFullYear()
                        + "-"
                        + ((appointmentDate.getMonth() + 1) < 10 ? "0" + (appointmentDate.getMonth() + 1) : (appointmentDate.getMonth() + 1))
                        + "-"
                        + (appointmentDate.getDate() < 10 ? "0" + appointmentDate.getDate() : appointmentDate.getDate());
      // USING TIME AS A CHILDREN KEY
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
  }

  // CHECK IF A GIVEN TIME SLOT FOR A PARTICULAR DATE IS AVAILABLE.
  getSlotAvailability (date, hour) {
    // console.log(date);
    if ( this.appointments[date] && this.appointments[date][hour]) {
      return true;
    }
    return false;
  }

  // GET ALL THE APPOINTMENTS FOR A PARTICULAR DATE AND TIME
  getAppointments (date, hour) {
    return this.appointments[date][hour];
  }

  // GET WHERE THE APPOINTMENT SHOULD BE DRAWN INSIDE THE SLOT BASED ON ON WHICH MINUTES IT STARTS AND THE DURATION FOR THAT APPOINTMENT
  getAppointmentPosition (date, hour, id) {
    let appointment = this.appointments[date][hour].filter(x => x.id === id);

    let position = [];
    position["height"] = (new Date(appointment[0]["endTime"]).getTime() - new Date(appointment[0]["startTime"]).getTime()) / 60 / 1000 * 2;
    position["topOffset"] = (new Date(appointment[0]["startTime"]).getTime() - new Date(appointment[0]["startTime"]).setMinutes(0)) / 60 / 1000 * 2;
    return position;
  }

  // SUBMITTING THE SCHEDUALING FORM AND UPDATE THE VIEW FOR OTHER USERS.
  schedualAppointment(appointment) {
    this.name = appointment.name;
    this.email = appointment.email;
    this.phoneNumber = appointment.phoneNumber;

    // TODO: HERE WE SHOULD CALL THE SERVER TO UPDATE THE DATA SOURCE (slots.json)

    //this.realtime.schedualAppointment(appointment);
    //let realtime = RealtimeService();
    //this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }

  ngOnInit() {
  }

}
