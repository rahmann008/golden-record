import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicaterecordsComponent } from './duplicaterecords.component';

describe('DuplicaterecordsComponent', () => {
  let component: DuplicaterecordsComponent;
  let fixture: ComponentFixture<DuplicaterecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicaterecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicaterecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
