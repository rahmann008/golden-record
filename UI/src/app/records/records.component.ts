import { AfterViewInit, OnInit, Component, ViewChild, getDebugNode, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { GraphdataService } from '../services/graphdata.service';
import { Router } from '@angular/router';
import { UtillsService } from '../services/utills.service';
import { MatSort, MatSortable } from '@angular/material/sort';
import { local } from 'd3';




// export interface userInterface {
//   id: number;
//   label: string;
//   position: number;
//   group: string;
//   level: string;
//   // duplicates: boolean
// }

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss']
})
export class RecordsComponent implements OnInit, AfterViewInit{
  
  records: any = {}
  nodes: any = []
  links: any =[]
  merged: any = {};
  ismergeAllRecordsClicked : boolean = false;
  isRecordUpdated: boolean;

  constructor(private graphdataservice: GraphdataService,
              private route : Router,
              private utillservice : UtillsService) { 

    // this.records = this.route.getCurrentNavigation()?.extras.state

    // this.nodes = JSON.parse(this.records?.["nodeEle"]);
    // this.links = JSON.parse(this.records?.["linkEle"]);
    let bool = localStorage.getItem('isRecordUpdated');
    this.isRecordUpdated = bool === 'true'? true : false

this.setNodesAndLinks()

  }

  setNodesAndLinks(){
    this.nodes = JSON.parse(<any>localStorage.getItem('nodes'))
    this.links = JSON.parse(<any>localStorage.getItem('links'))
  }

  ngOnInit(): void { 

    this.initializeTable()
    this.dataSource.filterPredicate = this.getFilter()
    let tabledata = this.dataSource.data;

    for(let data of tabledata ){
      this.merged[data.rec_id] = false;
    }

    // localStorage.setItem('merged', JSON.stringify(this.merged))


    this.utillservice.deletesubject.subscribe((ids : any) => {
          this.isRecordUpdated = false;
          localStorage.setItem('isRecordUpdated', 'false')

          let alllinkedlinks = [];

         for(let deletedrecord of ids.deleted){
             let idx = this.nodes.findIndex((rec : any) => rec.rec_id === deletedrecord.rec_id)
             if(idx >= 0) this.nodes.splice(idx, 1)

             let linkedLinks = this.links.filter((rec : any) => rec.source === deletedrecord.rec_id || rec.target === deletedrecord.rec_id)

            alllinkedlinks.push(...linkedLinks);
            }


            for(let link of alllinkedlinks){
              let idx = this.links.findIndex((rec : any) => rec.source === link.source && rec.target === link.target)
              if(idx >= 0) this.links.splice(idx, 1)
            }
            
            let idx = this.links.findIndex((rec : any) => rec.source === ids.master.rec_id || rec.target === ids.master.rec_id)

           if(idx < 0){
            let masterlink = {source : ids.master.rec_id, target : ids.master.rec_id, strength : 1}
            this.links.push(masterlink)
           }


            localStorage.setItem('nodes', JSON.stringify(this.nodes))
            localStorage.setItem('links', JSON.stringify(this.links))
            this.setNodesAndLinks()

            
            let duplicatecount = this.getRespectiveDuplicates(ids.master).length - 1;
            if(duplicatecount === 0) this.merged[ids.master.rec_id] = true;
            localStorage.setItem('merged', JSON.stringify(this.merged))
            
    })
  }

  tabledatasource = []
  initializeTable(){

    let keyscount = Object.keys(this.merged)

    let masterDuplicateIds = this.extractMaterDuplicateIds()

    let masterduplicates = this.extractMasterRecords(masterDuplicateIds)
    for(let record of masterduplicates){

      let numberofduplicates =this.getRespectiveDuplicates(record).length - 1;
      record["duplicatecount"] = numberofduplicates;
    }


    if(keyscount.length > 0){
       for(let key of keyscount){
           if(this.merged[key]){
            let record = this.nodes.find((rec : any) => rec.rec_id === key);
            record["duplicatecount"] = 0;
            masterduplicates.push(record)
           }
       }
    }



    this.dataSource.data = masterduplicates;
  }



  initializeData(id : string){
      return this.dataSource.data.find((rec : any) => rec.rec_id === id && rec.duplicatecount === 0)  
  }

  getFilter(){
    return(data : any, filter: string): boolean => {
      return data.given_name.startsWith(filter)
    }
  }

  
  extractMaterDuplicateIds(){
    let sourceIds: any = [];
    let targetIds : any = [];
    let mastertargetID: any = [];

    for(let link of this.links){
       sourceIds.push(link.source)
    }


    let uniqueSourceIds = [...new Set([...sourceIds])]

    for (let link of this.links){
      targetIds.push(link.target)
      if(link.source === link.target) mastertargetID.push(link.target);
    }


    let uniqueTargetIds = [...new Set([...targetIds])];

    for(let targetid of uniqueTargetIds){
      let isSource = uniqueSourceIds.findIndex( (id : any) => id === targetid)

      if(isSource < 0){
        mastertargetID.push(targetid)      
      }

    }

    return mastertargetID;
  }

  
  extractMasterRecords(masterDuplicateIds : any){

      let  masterDuplicateRecords : any = [];
      for(let masterduplicateid of masterDuplicateIds){
        let idx = this.nodes.findIndex( (rec : any) => rec.rec_id === masterduplicateid)

        if(idx >= 0){
          masterDuplicateRecords.push(this.nodes[idx])
        }
      }

      return masterDuplicateRecords
  }


  // find total number of duplicates

  numberOfDuplicates(masterrecord: any){
        let duplRecords: any = [];

          let totalDuplicates = this.links.filter((record : any) => record.target === masterrecord.rec_id )
          if (totalDuplicates.length === 0) return duplRecords;

          if(totalDuplicates.length === 1 && totalDuplicates[0].source === totalDuplicates[0].target) return totalDuplicates;

          duplRecords.push(...totalDuplicates)
          let sourcearr = this.getSource(totalDuplicates)

          let nodesarray = []
          for(let source of sourcearr){

            let node = this.nodes.filter((record : any) => record.rec_id === source)
            nodesarray.push(...node)
          }

          for(let node of nodesarray){
            this.numberOfDuplicates(node)
          }
          
          if(duplRecords.length === 1 && duplRecords[0].source === duplRecords[0].target) duplRecords = []; 
         
          return duplRecords;
  }

  getRespectiveDuplicates(masterrecord : any){
     let duplArray = this.numberOfDuplicates(masterrecord) 
     let duplicatelinkarray = [];
     for(let dupllink of duplArray){
         duplicatelinkarray.push(dupllink.source);
         duplicatelinkarray.push(dupllink.target)
     }
 
    let  uniqueduplicateids = [... new Set([...duplicatelinkarray])]
    let linkarray = []
    for(let id of uniqueduplicateids){
      let link = this.links.filter((rec : any) => rec.source === id || rec.target === id);
      linkarray.push(...link)
   }

    let nodesaaray = this.getAllduplicates(linkarray)

    
     return nodesaaray;
  }

  searchRecord(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }


  getSource(duplArray : any){
    
   let sourcearr = [];

    for(let dupl of duplArray){
      sourcearr.push(dupl.source)
    }

    return sourcearr;
  }





  displayedColumns = ['position', 'name', 'duplicatecount', 'action'];
  dataSource = new MatTableDataSource<any>(this.nodes);

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  loadGraph(record : any){

    let recNode : any = [];
    let recLink : any = [];
    // this.setNodesAndLinks();

    let duplicaterecLink = this.numberOfDuplicates(record)
    let duplicatelinkarray = [];
    for(let dupllink of duplicaterecLink){
        duplicatelinkarray.push(dupllink.source);
        duplicatelinkarray.push(dupllink.target)
    }

   let  uniqueduplicateids = [... new Set([...duplicatelinkarray])]
   
   for(let id of uniqueduplicateids){
      let link = this.links.filter((rec : any) => rec.source === id || rec.target === id);
      recLink.push(...link)
   }

    recNode = this.getAllduplicates(recLink)

    
    setTimeout(() => {
      this.route.navigate(['/graph'], {
        state:{
          masterRecord: JSON.stringify(record),
          nodeEle: JSON.stringify(recNode),
          linkEle: JSON.stringify(recLink)
        }
      })
    },1000)
    }


    getAllduplicates(recLink: any){
      let ids : any = []
      for(let link of recLink){
           ids.push(link.source)
           ids.push(link.target)
      }

      let uniqueids = [...new Set([...ids])]
      let recnodes = []
      for(let id of uniqueids){
           let filterednodes = this.nodes.filter((rec : any) => rec.rec_id === id)

           recnodes.push(...filterednodes)
    }

    return recnodes;
    }


    downLoadList(){
      const exportRecord: Partial<any>[] = this.dataSource.data.map((record : any, index : number) => ({
        "Sl No." : index + 1,
        "Name": record.given_name +' ' + record.surname,
        "Number of duplicates": this.getRespectiveDuplicates(record).length - 1,
        "Social Security Id": record.soc_sec_id
      }));

  
      this.utillservice.exportArrayToExcel(exportRecord, "Master Duplicates");
    }


    downloadRespectiveDuplicates(masterrecord : any){
      let duplicatenodes = this.getRespectiveDuplicates(masterrecord)
    

      let exportRecord : any[] = duplicatenodes.map((record : any, index: number) => ({
        "Sl No." : index + 1,
        "Name": record.given_name +' ' + record.surname,
        "Social Security Id": record.soc_sec_id
      }))

      this.utillservice.exportArrayToExcel(exportRecord, "Duplicates")
    }


    mergeduplicates(masterrecord : any){

      let duplicaterecords = this.getRespectiveDuplicates(masterrecord)
      let idx = duplicaterecords.findIndex( (rec : any) => rec.rec_id === masterrecord.rec_id)

      if(idx > 0) duplicaterecords.splice(idx, 1);

      for(let record of duplicaterecords){
        let index = this.nodes.findIndex((rec : any) => rec.rec_id === record.rec_id);
        this.nodes.splice(index, 1)
      }

      let recID = masterrecord.rec_id
      this.merged[recID] = true;
    
      return duplicaterecords;
    }


    deleteInLocalStorage(duplicaterecords : any){

      let originalrecords: any  = [];

      originalrecords = JSON.parse(<string>localStorage.getItem("nodes"));

      let originalrecordsarray = Object.keys(originalrecords).map( key => originalrecords[key])

      
      for(let rec of duplicaterecords){
              let index = originalrecordsarray.findIndex( (record : any) => record.rec_id === rec.rec_id);
              if(index >= 0) originalrecordsarray.splice(index, 1)
      }


      localStorage.setItem("nodes", JSON.stringify(originalrecordsarray))

    }

    mergeRecords(masterrecord : any){
     let duplicaterecords = this.mergeduplicates(masterrecord);
     this.initializeTable()
     this.deleteInLocalStorage(duplicaterecords)

    }


    downloadAllmergeRecords(){
        
        let tobedownloaded : any = [];
        // tobedownloaded =JSON.parse(<string>localStorage.getItem("originalrecords"));
        tobedownloaded =JSON.parse(<string>localStorage.getItem("nodes"));
        let records = Object.keys(tobedownloaded).map( key => tobedownloaded[key])

        this.utillservice.exportArrayToExcel(records, "Records")
    }

    mergeAllRecords(){

      if(this.dataSource.data.every((rec : any) => rec.duplicatecount === 0)) this.downloadUniqueRecords();

      else{
        for(let data of this.dataSource.data){
          data['duplicatecount'] = 0
        }
  
        this.isRecordUpdated = false;
        localStorage.setItem('isRecordUpdated', 'false')
  
        let masterduplicates = this.dataSource.data;
  
        let allmergedrecords: any = [];
        for(let masterrecord of masterduplicates){ 
          if(!masterrecord.duplicatecount){
            let recordsarray = this.mergeduplicates(masterrecord);
            allmergedrecords.push(...recordsarray)
          }
  
        }
  
        this.deleteInLocalStorage(allmergedrecords)
    
        this.ismergeAllRecordsClicked = true; 
        let tabledata = this.dataSource.data;
  
        for(let data of tabledata ){
          this.merged[data.rec_id] = true;
        }
  
        this.downloadUniqueRecords()
      }

      
    }


    downloadUniqueRecords(){
      let uniquerecords: any = [];
      uniquerecords = JSON.parse(<string>localStorage.getItem("uniquerecords"));
      let records = Object.keys(uniquerecords).map( key => uniquerecords[key])
      this.utillservice.exportArrayToExcel(records, "Merged Records")
    }


    getMerged(record : any){
      if(record.duplicatecount === 0) return true
      else return false
    }

    getState(){
      let tabledata = [];
      
      for(let data of this.dataSource.data){
         tabledata.push(data.duplicatecount)
      }

      if(tabledata.every((state : any) => state === 0)) return "Download golden records"
      else return "Merge and download golden records"
    }


}