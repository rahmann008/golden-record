import { Component, OnInit } from '@angular/core';
import { UserdetailsService } from '../services/userdetails.service';
import { UtillsService } from '../services/utills.service';


@Component({
  selector: 'app-userdetails',
  templateUrl: './userdetails.component.html',
  styleUrls: ['./userdetails.component.scss']
})
export class UserdetailsComponent implements OnInit {
  userEmail = ''
  givenName = ''
  surName = ''
  streetNumber = ''
  addressOne = ''
  addressTwo = ''
  suburb = ''
  stateName = ''
  userLocation = ''
  contactNumber = ''
  customerType = ''
  dob =''
  socialsecurityID = ''
  zipCode = ''
  memberID = ''
  nickName = ''
  phoneticFirstName = ''
  phoneticLastName = ''
  normalizedFirstName = ''
  normalizedLastName = ''

  constructor(private userdetail : UserdetailsService, private utillservice : UtillsService) { }

  ngOnInit(): void {
    let userdetails : any = this.userdetail.userobject

    this.givenName = userdetails.given_name; 
    this.surName = userdetails.surname;
    this.streetNumber = userdetails.street_number;
    this.addressOne = userdetails.address_1;
    this.addressTwo = userdetails.address_2;
    this.suburb = userdetails.suburb;
    this.stateName = userdetails.state;
    this.dob = userdetails.date_of_birth;
    this.socialsecurityID = userdetails.soc_sec_id;
    this.zipCode = userdetails.postcode;


    this.utillservice.editedsubject.subscribe((res : any) => {
      
    })
  }

  closeUserDetails(){
    this.userdetail.userdetails.next(false)
  }

}
