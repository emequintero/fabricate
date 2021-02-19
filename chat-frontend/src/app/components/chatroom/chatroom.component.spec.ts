import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { ChatroomComponent } from './chatroom.component';

describe('ChatroomComponent', () => {
  let component: ChatroomComponent;
  let fixture: ComponentFixture<ChatroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatroomComponent ],
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not send a message with no message content', ()=>{
    component.messageContent = "";
    component.sendMessage();
    expect(component.isFormValid).toBeFalse();
  });

  it('should not send a message with no other users in room', ()=>{
    component.headerUsers = [];
    component.sendMessage();
    expect(component.isFormValid).toBeFalse();
  });

  it('should not send a message when a duplicate room exists', ()=>{
    component.duplicateRoom = true;
    component.sendMessage();
    expect(component.isFormValid).toBeFalse();
  });

  it('should format date using shortTime if it was sent today', ()=>{
    let result = component.determineDateFormat(new Date());
    expect(result).toEqual('shortTime');
  });

  it('should format date using shortDate if it was sent before today', ()=>{
    let result = component.determineDateFormat(new Date('2/18/2021'));
    expect(result).toEqual('shortDate');
  });
});
