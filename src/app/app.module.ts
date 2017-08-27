import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { PubNubAngular } from 'pubnub-angular2';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';

import { DataService } from './data.service';
import { RealtimeService } from './realtime.service';
import { SlotComponent } from './slot/slot.component';

@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    SlotComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  providers: [PubNubAngular, DataService, RealtimeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
