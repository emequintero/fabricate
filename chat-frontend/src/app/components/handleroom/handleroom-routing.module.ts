import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HandleroomComponent } from './handleroom.component';

const routes: Routes = [
  { path: '', component: HandleroomComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HandleroomRoutingModule { }
