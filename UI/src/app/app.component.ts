import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GraphdataService } from './services/graphdata.service';
import { UserdetailsService } from './services/userdetails.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GoldenRecords';
  isUserDetails: boolean = false;

  constructor(private graphdata : GraphdataService,private userdetail : UserdetailsService, private route: Router){
    
  }

  nodes: any = []
  links: any = []
  ngOnInit(){
    this.userdetail.userdetails.subscribe(val => this.isUserDetails = val)
  }



  loadGraph(){

    this.route.navigate(['/graph'], {
      state:{
        nodeEle: JSON.stringify(this.nodes),
        linkEle: JSON.stringify(this.links)
      }
    })
    }
}
