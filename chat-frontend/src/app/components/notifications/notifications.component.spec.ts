import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Request } from 'src/app/models/request';
import { Room } from 'src/app/models/room';
import { User } from 'src/app/models/user';

import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationsComponent ],
      imports: [
        RouterTestingModule.withRoutes([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call enterRoom when user approves a request', ()=>{
    let functionSpy = spyOn(component, 'enterRoom');
    let mila:User = new User({}, 'Mila');
    let room:Room = new Room([mila]);
    let request:Request = new Request(mila, room, 'pending');
    component.handleRequest(request, 'accepted');
    expect(functionSpy).toHaveBeenCalled();
  });
});
