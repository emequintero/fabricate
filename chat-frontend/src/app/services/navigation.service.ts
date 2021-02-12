import { Location } from '@angular/common';
import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService implements OnDestroy{
  //keep track of navigation history
  history:Array<string> = new Array<string>();
  routerEventsSub:Subscription = new Subscription();
  constructor(private router:Router, private location:Location) {
    this.routerEventsSub = this.router.events.subscribe(event=>{
      //chec if event is for navigation ending successfully
      if(event instanceof NavigationEnd){
        //add actual url accessed
        this.history.push(event.urlAfterRedirects);
      }
    });
  }
  ngOnDestroy(): void {
    //unsubscribe to events
    this.routerEventsSub.unsubscribe();
  }

  back(){
    //remove last route accessed
    this.history.pop();
    //if there is a history send to prev route
    if(this.history.length > 0){
      this.location.back();
    }
    //send to root
    else{
      this.router.navigate(['home']);
    }
  }
}
