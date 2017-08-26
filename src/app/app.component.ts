import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PubNubAngular } from 'pubnub-angular2';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PubNubAngular]
})

export class AppComponent {

  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  date = new Date;
  firstDayOfTheWeek = new Date(this.date.setDate(this.date.getDate() - this.date.getDay())).toUTCString();
  weekDays = [];

  appointments = [];
  reservedAppointment = [];
  schedualedAppointment = [];

  newAppointment = false;
  newAppointmentID = "";

  rForm: FormGroup;
  appointment:any;
  name:string = '';
  email:string = '';
  phoneNumber:string = '';

  pubnubService;

  constructor(private http: Http, public pubnub: PubNubAngular, public fb: FormBuilder) {
    // CREATING THE PubNub OBJECT AND INITIALIZE IT.
    this.pubnubService = new PubNubAngular();
    this.pubnubService.init({
      publishKey: 'pub-c-3472c925-40bf-4de2-9526-5cc4911e6eff',
      subscribeKey: 'sub-c-e3ea3d48-89ed-11e7-af73-96e8309537a2'
    });
    this.pubnubService.subscribe({channels: ['carmacth'], triggerEvents: ['message', 'status']});
    // LISITING TO ANY MESSAGES COMING FROM THE USERS.
    this.pubnubService.getMessage('carmacth', (msg) => {
      let message = msg.message;
      switch (message.status) {
        case 'RESERVED' : {
          this.reservedAppointment.push(message.appointment);
          break;
        }
        case 'UNRESERVED': {
          var index = this.reservedAppointment.indexOf(message.appointment, 0);
          if (index > -1) {
             this.reservedAppointment.splice(index, 1);
          }
          break;
        }
        case 'SCHEDUALED' : {
          this.schedualedAppointment.push(message.appointment);
          break;
        }
      }

    });

    // GET THE WEEK DAYS FOR BUILDING THE CALENDAT VIEW.
    this.daysInWeek();

    // GETTING THE DATA FROM THE DATA SOURCE AND FILTER THE JSON ARRAY TO MAKE IT EASIER FOR READING AND ITIRATING ON ITS ELEMENTS
    this.http.get('assets/slots.json').subscribe(res => this.filterAppointmentList(res.json()));

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

  /* GENERIC FUNCTIONS */
  showNextWeek () {
    let date = new Date(this.firstDayOfTheWeek).setDate(new Date(this.firstDayOfTheWeek).getDate() + 7);
    this.firstDayOfTheWeek = new Date(new Date(date).setDate(new Date(date).getDate() - new Date(date).getDay())).toUTCString();
    this.daysInWeek();
  }
  showPrevWeek () {
    let date = new Date(this.firstDayOfTheWeek).setDate(new Date(this.firstDayOfTheWeek).getDate() - 7);
    this.firstDayOfTheWeek = new Date(new Date(date).setDate(new Date(date).getDate() - new Date(date).getDay())).toUTCString();
    this.daysInWeek();
  }
  daysInWeek () {
    this.weekDays = [];
    for (let day = new Date(this.firstDayOfTheWeek).getDate(); day < (new Date(this.firstDayOfTheWeek).getDate() + 7) ; day++) {
      this.weekDays.push(new Date(this.firstDayOfTheWeek).setDate(day));
    }
  }
  createRange(number){
    var items: number[] = [];
    for(var i = 1; i <= number; i++){
       items.push(i);
    }
    return items;
  }
  /* ./GENERIC FUNCTIONS */

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

  // RESERVE A SLOT AND SHOW IT AS A RESERVED SLOT ON OTHER USERS, AND SHOW THE FORM OF SCHEDULE THE SLOT
  reserveAppointment (appointmentID) {
    this.newAppointment = true;
    this.newAppointmentID = appointmentID;
    let message = {"appointment": this.newAppointmentID, "status": "RESERVED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }

  // UNRESERVE A SLOT AND SHOW IT AS AN AVAILABLE SLOT ON OTHER USERS, AND HIDE THE FORM OF SCHEDULE THE SLOT.
  unreserveAppointment (appointmentID) {
    this.newAppointment = false;
    this.newAppointmentID = '';
    let message = {"appointment": appointmentID, "status": "UNRESERVED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }

  // SUBMITTING THE SCHEDUALING FORM AND UPDATE THE VIEW FOR OTHER USERS.
  makeAppointment(appointment) {
    this.name = appointment.name;
    this.email = appointment.email;
    this.phoneNumber = appointment.phoneNumber;

    // HERE WE SHOULD CALL THE SERVER TO UPDATE THE DATA SOURCE (slots.json)

    // UPDATING THE VIEW FOR OTHER USERS
    let message = {"appointment": this.newAppointmentID, "status": "SCHEDUALED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }
}
