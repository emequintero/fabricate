import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Request } from 'src/app/models/request';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';

import { HandleroomComponent } from './handleroom.component';

describe('HandleroomComponent', () => {
  let component: HandleroomComponent;
  let fixture: ComponentFixture<HandleroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandleroomComponent ],
      imports: [
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandleroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not create a room without selecting users', ()=>{
    component.submit();
    if(component.selectedUsers.length === 0){
      expect(component.isFormValid).toBeFalse();
    }
  });

  it('should not create a room that is in their pending requests', ()=>{
    let mila:User = new User({}, 'Mila', '123');
    let lula:User = new User({}, 'Lula', '321');

    component.curUser = mila;
    component.selectedUsers = [lula];
    let duplicateUsers:Array<User> = [mila, lula];
    let duplicateRoom:Room = new Room(duplicateUsers);
    let request = new Request(mila, duplicateRoom, 'pending');
    component.curUser.requests.push(request);
    let result = component.handleDisableSubmit();
    expect(result).toBeTrue();
  });

  it('should not create a room that is in their list of available rooms', ()=>{
    let mila:User = new User({}, 'Mila', '123');
    let lula:User = new User({}, 'Lula', '321');

    component.curUser = mila;
    let duplicateUsers:Array<User> = [mila, lula];
    let duplicateRoom:Room = new Room(duplicateUsers);
    component.roomsCurUser.push(duplicateRoom);
    component.handleUser(lula, 'add');
    let result = component.handleDisableSubmit();
    expect(result).toBeTrue();
  });
});
