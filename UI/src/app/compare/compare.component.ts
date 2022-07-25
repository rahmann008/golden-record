import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtillsService } from '../services/utills.service';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {

  toBeDisplayed : any = {};
  items: any = [];
  editForm : any;
  isEditClicked : boolean = false;
  formvalues : any;
  enableSave : boolean = false;
  editedvaleusobject : any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private utillservice: UtillsService) { 

    this.items = this.data.record;
    this.setDefaultDisplayFlag() 
    this.editForm =  this.createEditForm();
  }

  createEditForm() {
   let editForm: FormGroup = this.fb.group({
      id: [this.items[0].rec_id],
      firstName : [this.items[0].given_name],
      lastName : [this.items[0].surname],
      streetNo : [this.items[0].street_number],
      streetName : [this.items[0].address_1],
      locality : [this.items[0].address_2],
      suburb : [this.items[0].suburb],
      zip : [this.items[0].postcode],
      state : [this.items[0].state],
      dob : [this.items[0].date_of_birth],
      socialsecurityid : [this.items[0].soc_sec_id]
    })
    return editForm
  }

  ngOnInit(): void {
    this.formvalues = this.editForm.value
    let keys = Object.keys(this.formvalues);

    for(let key of keys){
      this.editedvaleusobject[key] = false;
    }

  }

  setDefaultDisplayFlag(){
    
    let keys = Object.keys(this.items[0]);

    for(let key of keys){
    this.toBeDisplayed[key] = false;
    }
    
  }


  getIndividualArray(keyname : string){
    let result = [];

    for(let item of this.items){
        result.push((<any>item)[keyname])
    }

    return result;
   }


   rows = {};
   getAllArrays(){
       let keys = Object.keys(this.items[0])
 
       for(let key of keys){
         (<any>this.rows)[key] = this.getIndividualArray(key)
       }
 
   }
 
            
 
   hideRowsWithSimilarValue(checked : boolean){
 
          let  tobedisplayedArray = Object.keys(this.toBeDisplayed)
 
          if(checked){
           this.getAllArrays()
 
           for(let header of tobedisplayedArray){
               let headervalue = (<any>this.rows)[header]
               this.toBeDisplayed[header] = headervalue.every((record : any) => record === headervalue[0])
           }
          }else{
           this.setDefaultDisplayFlag()
          }
   }

// defining edit form
   
   enableEdit(){
    console.log('edited')
    this.isEditClicked = true
   }


   isChanged(event : any, element: HTMLElement){

      let formcontrolname : any = element.getAttribute('formControlName');
      let currentValue = event.target.value;

      let existingvalue = this.formvalues[formcontrolname]
      console.log(currentValue, existingvalue)
      if(currentValue != existingvalue) {
        this.enableSave = true;
        this.editedvaleusobject[formcontrolname] = true;
      }
      else this.enableSave = false;
   }


   
   saveChanges(){
      
    let keys = Object.keys(this.editedvaleusobject)
    let localstoragenode = JSON.parse(<any>localStorage.getItem('nodes')) 
    let uniqueRecords = JSON.parse(<any>localStorage.getItem('uniquerecords'))
    let uniqueRecordsArray = Object.keys(uniqueRecords).map((key : any) => uniqueRecords[key])

    let oldval = this.items[0];

    let nameChanged = false;
    for(let key of keys){
      if(this.editedvaleusobject[key]) {
        let value =  this.editForm.value[key]

        let fieldName = this.getFieldName(key)
        this.items[0][fieldName] = value;
        

        if(fieldName === 'given_name') nameChanged = true;

        for(let node of localstoragenode){
          if(node.rec_id === this.items[0].rec_id) node[fieldName] = value;
        }

        for(let record of uniqueRecordsArray){
          if(record.rec_id === this.items[0].rec_id) record[fieldName] = value;
        }
      }
    }

    localStorage.setItem('nodes', JSON.stringify(localstoragenode))
    localStorage.setItem('uniquerecords', JSON.stringify(uniqueRecordsArray))
    localStorage.setItem('isRecordUpdated', 'false')
    this.enableSave = false;

    let data = {master : this.items[0], changed : nameChanged, oldVal : oldval}

    this.utillservice.editedsubject.next(data);
   }

   getFieldName(key : string){
      switch(key){
        case 'id' : return 'rec_id';
        case 'firstName' : return 'given_name';
        case 'lastName' : return 'surname';
        case 'streetNo' : return 'street_number';
        case 'streetName' : return 'address_1';
        case 'locality' : return 'address_2';
        case 'suburb' : return 'suburb';
        case 'zip' : return 'postcode';
        case 'state' : return 'state';
        case 'dob' : return 'date_of_birth';
        case 'socialsecurityid' : return 'soc_sec_id';
        default : return  ''  
      }
   }
}