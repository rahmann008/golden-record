import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserdetailsService {

  constructor() { }
  userobject = {}
  userdetails = new Subject<boolean>()
}
