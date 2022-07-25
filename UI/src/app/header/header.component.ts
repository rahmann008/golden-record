import { Component, OnInit } from '@angular/core';
import { GraphdataService } from '../services/graphdata.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor( private graphservice: GraphdataService) { }
  displaySearch: boolean = false;
  ngOnInit(): void {
  }

}
