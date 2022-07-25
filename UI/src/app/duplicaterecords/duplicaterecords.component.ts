import { Component, OnInit,AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CompareComponent } from '../compare/compare.component';
import { GraphdataService } from '../services/graphdata.service';
import { UtillsService } from '../services/utills.service';


@Component({
  selector: 'app-duplicaterecords',
  templateUrl: './duplicaterecords.component.html',
  styleUrls: ['./duplicaterecords.component.scss']
})
export class DuplicaterecordsComponent implements OnInit, AfterViewInit{
 
  @Input() allRecords : any;
  @Input() masterRecord : any;
  @Output() changed = new EventEmitter<{}>();
  records: any = [];
  constructor(public dialog : MatDialog, private utillservice : UtillsService, private graphservice :GraphdataService) { }

  checkboxes: any = {};
  displayedColumns = ['FirstName', 'LastName', 'DOB', 'Type', 'SocialSecurityId', 'action'];
  dataSource = new MatTableDataSource<any>();
  
  ngOnInit(): void {
    this.setCheckboxes(false);
    
    this.records = this.prepareData(this.allRecords);

    setTimeout(() => {
    this.updateTable(this.records)
      
    }, 5000);

  }

  prepareData(records : any){
    for(let record of records){
      if(record.rec_id === this.masterRecord.rec_id) record['type'] = 'master';
      else record['type'] = 'duplicate'
   }

   let temp = records[0];
   for(let index in records){
     if(records[index].type === 'master') {
       records[0] = records[index];
       records[index] = temp;
     }
   }
   return records;
  }

  ngOnChanges(){
    let tablerecords = this.prepareData(this.allRecords)
    this.updateTable(tablerecords)
  }

  deleteMasterRecordFromTable(){
    let idx = this.records.findIndex((rec : any) => rec.rec_id === this.masterRecord.rec_id)
    if(idx >= 0) this.records.splice(idx, 1);
  }

  updateTable(records : any){
    this.dataSource.data = records;
  }

  
  setCheckboxes(value : boolean){
    for(let rec of this.records){
      if(rec.type === 'duplicate') this.checkboxes[rec.rec_id] = value;
    }
  }


  isDisabled(){
    let keys = Object.keys(this.checkboxes);
    let count = 0;

    for(let key of keys){
      if(this.checkboxes[key]) count++
    }

    if(count >= 1) return false;
    return true;
  }


  @ViewChild(MatPaginator) paginator!: MatPaginator
  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
  }



  selectRecords(record : any, checked : boolean){
      this.checkboxes[record.rec_id] = checked;
  }



  selectAllRecords(checked : boolean){
      if(checked) this.setCheckboxes(true)
      else this.setCheckboxes(false)
  }


  compareRecords(){

     let allRecordsIds = Object.keys(this.checkboxes);
     let selectedRecordIds = this.getSelectedRecordsIds(allRecordsIds)

     let selectedRecords = [this.masterRecord]
     for(let id of selectedRecordIds){
         let eachselectedrecord = this.records.filter((rec : any) => rec.rec_id === id);
         selectedRecords.push(...eachselectedrecord)
     }

     
     this.displayCompareTable(selectedRecords)
     
  }



  getSelectedRecordsIds(allrecordids : any){
    let selectedrecordids = [];

    for(let ids of allrecordids){
        if(this.checkboxes[ids]){
          selectedrecordids.push(ids)
        }
    }

    return selectedrecordids;
  }




  displayCompareTable(selectedrecords : any){

    const dialogRef = this.dialog.open(CompareComponent, {
      width: '1000px',
      data: {record : selectedrecords},
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }




  deleteSelectedRecords(){
     let keys = Object.keys(this.checkboxes);
     
     let selectedrecordids = this.getSelectedRecordsIds(keys)

     let deletedrecord : any = []; 
     for(let id of selectedrecordids){
        let idx = this.records.findIndex((rec : any) => rec.rec_id === id);
        if(idx >= 0) {
          deletedrecord.push(this.records[idx])
          this.records.splice(idx,1)
        }

     delete this.checkboxes[id];
     }
     this.updateTable(this.records)
     
     let sendObj = { master : this.masterRecord, deleted : deletedrecord };
     this.changed.emit(sendObj);
     this.utillservice.deletesubject.next(sendObj)
    
  }



}
