import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleroomComponent } from './handleroom.component';

describe('HandleroomComponent', () => {
  let component: HandleroomComponent;
  let fixture: ComponentFixture<HandleroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandleroomComponent ]
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
});
