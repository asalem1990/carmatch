import { Injectable } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';

@Injectable()
export class RealtimeService {
  pubnubService;

  reservedAppointments = [];
  schedualedAppointments = [];

  isAppointmentReseved = false;
  appointmentResevedID = "";

  constructor(public pubnub: PubNubAngular) {
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
          this.reservedAppointments.push(message.appointment);
          break;
        }
        case 'UNRESERVED': {
          var index = this.reservedAppointments.indexOf(message.appointment, 0);
          if (index > -1) {
             this.reservedAppointments.splice(index, 1);
          }
          break;
        }
        case 'SCHEDUALED' : {
          this.schedualedAppointments.push(message.appointment);
          var index = this.reservedAppointments.indexOf(message.appointment, 0);
          if (index > -1) {
             this.reservedAppointments.splice(index, 1);
          }
          break;
        }
      }

    });
  }

  // RESERVE A SLOT AND SHOW IT AS A RESERVED SLOT ON OTHER USERS, AND SHOW THE FORM OF SCHEDULE THE SLOT
  reserveAppointment (appointmentID) {
    this.isAppointmentReseved = true;
    this.appointmentResevedID = appointmentID;
    let message = {"appointment": this.appointmentResevedID, "status": "RESERVED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }

  // UNRESERVE A SLOT AND SHOW IT AS AN AVAILABLE SLOT ON OTHER USERS, AND HIDE THE FORM OF SCHEDULE THE SLOT.
  unreserveAppointment (appointmentID) {
    this.isAppointmentReseved = false;
    this.appointmentResevedID = '';
    let message = {"appointment": appointmentID, "status": "UNRESERVED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
  }

  // SUBMITTING THE SCHEDUALING FORM AND UPDATE THE VIEW FOR OTHER USERS.
  schedualAppointment() {
    let message = {"appointment": this.appointmentResevedID, "status": "SCHEDUALED"};
    this.pubnubService.publish({channel: 'carmacth', message: message}, (response) => {});
    this.isAppointmentReseved = false;
    this.appointmentResevedID = '';
  }

}
