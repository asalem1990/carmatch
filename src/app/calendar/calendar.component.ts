import { Component, OnInit } from '@angular/core';
import { SlotComponent } from '../slot/slot.component'



@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [SlotComponent]
})
export class CalendarComponent implements OnInit {
  calendarDate = new Date;
  weekStartingDayDate = new Date(this.calendarDate.setDate(this.calendarDate.getDate() - this.calendarDate.getDay())).toUTCString();
  weekDays = [];



  constructor(public slot: SlotComponent) {
    // GET THE WEEK DAYS FOR BUILDING THE CALENDAT VIEW.
    this.getWeekDays();
  }



  /* GENERIC FUNCTIONS */
  showNextWeek () {
    let date = new Date(this.weekStartingDayDate).setDate(new Date(this.weekStartingDayDate).getDate() + 7);
    this.weekStartingDayDate = new Date(new Date(date).setDate(new Date(date).getDate() - new Date(date).getDay())).toUTCString();
    this.getWeekDays();
  }
  showPrevWeek () {
    let date = new Date(this.weekStartingDayDate).setDate(new Date(this.weekStartingDayDate).getDate() - 7);
    this.weekStartingDayDate = new Date(new Date(date).setDate(new Date(date).getDate() - new Date(date).getDay())).toUTCString();
    this.getWeekDays();
  }
  showCurrentWeek () {
    let date = new Date();
    this.weekStartingDayDate = new Date(new Date(date).setDate(new Date(date).getDate() - new Date(date).getDay())).toUTCString();
    this.getWeekDays();
  }
  getWeekDays () {
    this.weekDays = [];
    for (let day = new Date(this.weekStartingDayDate).getDate(); day < (new Date(this.weekStartingDayDate).getDate() + 7) ; day++) {
      this.weekDays.push(new Date(this.weekStartingDayDate).setDate(day));
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


  ngOnInit() {
  }

}
