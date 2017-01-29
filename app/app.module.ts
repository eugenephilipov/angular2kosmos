import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { server_interaction }  from './services/server_interaction';

import { AppComponent }  from './app.component';

@NgModule({
  imports: [ BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
