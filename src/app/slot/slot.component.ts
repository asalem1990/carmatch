import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../data.service';
import { RealtimeService } from '../realtime.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.scss']
})
export class SlotComponent implements OnInit {
  @Input() day:any;
  @Input() hour:any;

  rForm: FormGroup;
  name:string = '';
  email:string = '';
  phoneNumber:string = '';

  constructor(public data: DataService, public realtime: RealtimeService, public fb: FormBuilder) {
    // CREATING THE FORM OBJECT WHICH WILL BE USED TO DRAW EACH FORM IN THE calendar
    this.rForm = fb.group({
      'name' : [null,Validators.required],
      'email' : [null,Validators.required],
      'phoneNumber' : [null,Validators.required]
    });
  }

  // GET WHERE THE APPOINTMENT SHOULD BE DRAWN INSIDE THE SLOT BASED ON ON WHICH MINUTES IT STARTS AND THE DURATION FOR THAT APPOINTMENT
  getAppointmentPosition (date, hour, id) {
    let appointment = this.data.appointments[date][hour].filter(x => x.id === id);
    let position = [];
    position["height"] = (new Date(appointment[0]["endTime"]).getTime() - new Date(appointment[0]["startTime"]).getTime()) / 60 / 1000 * 2;
    position["topOffset"] = (new Date(appointment[0]["startTime"]).getTime() - new Date(appointment[0]["startTime"]).setMinutes(0)) / 60 / 1000 * 2;
    return position;
  }

  // SUBMITTING THE SCHEDUALING FORM AND UPDATE THE VIEW FOR OTHER USERS.
  schedualAppointment(appointment) {
    console.log(appointment);
    this.name = appointment.name;
    this.email = appointment.email;
    this.phoneNumber = appointment.phoneNumber;

    // TODO: HERE WE SHOULD CALL THE SERVER TO UPDATE THE DATA SOURCE (slots.json)

    this.realtime.schedualAppointment();
  }

  ngOnInit() {
  }

}
