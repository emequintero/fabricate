import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  //keep track of navigation history
  history:Array<string> = new Array<string>();
  constructor(private router:Router, private location:Location) {
    this.router.events.subscribe(event=>{
      //chec if event is for navigation ending successfully
      if(event instanceof NavigationEnd){
        //add actual url accessed
        this.history.push(event.urlAfterRedirects);
      }
    });
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
      this.router.navigate(['main']);
    }
  }
}
