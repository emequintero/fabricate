import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandleroomRoutingModule } from './handleroom-routing.module';
import { HandleroomComponent } from './handleroom.component';

@NgModule({
  imports: [
    CommonModule,
    HandleroomRoutingModule
  ],
  declarations: [HandleroomComponent]
})
export class HandleroomModule { }