import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        FormsModule, 
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow login if missing username', ()=>{
    if(component.username.length === 0){
      component.submitUser();
      expect(component.isFormValid).toBeFalse();
    }
  });

  it('should not allow login if missing profile pic', ()=>{
    if(component.selectedProfilePic === null){
      component.submitUser();
      expect(component.isFormValid).toBeFalse();
    }
  });

  it('should not allow login if username is taken', ()=>{
    if(component.isUsernameUnavailable){
      component.submitUser();
      expect(component.isFormValid).toBeFalse();
    }
  });

  it('should not redirect to home if missing username', ()=>{
    let navigateSpy = spyOn(component.router, 'navigate');
    if(component.username.length === 0){
      component.submitUser();
      expect(navigateSpy).not.toHaveBeenCalled();
    }
  });

  it('should not redirect to home if missing profile pic', ()=>{
    let navigateSpy = spyOn(component.router, 'navigate');
    if(component.selectedProfilePic === null){
      component.submitUser();
      expect(navigateSpy).not.toHaveBeenCalled();
    }
  });

  it('should not redirect to home if username is unavailable', ()=>{
    let navigateSpy = spyOn(component.router, 'navigate');
    if(component.isUsernameUnavailable){
      component.submitUser();
      expect(navigateSpy).not.toHaveBeenCalled();
    }
  });
});
