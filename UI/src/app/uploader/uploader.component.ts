import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GraphdataService } from '../services/graphdata.service';



export interface Duplicaterecords {
       target : string;
       source : string
}

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})

export class UploaderComponent implements OnInit {
  // practiceForm: FormGroup = new FormGroup({});
  nodes: any = []
  links: any = []
  constructor(private route : Router, private graphdataservice: GraphdataService) {

   }

  ngOnInit(): void {
    // this.createForm()

  }

  
//   createForm(){
//     this.practiceForm = new FormGroup({
//         inputText : new FormControl(),
//         fieldArray: new FormArray([])
//     })
// }

// addFields(){
//     (<FormArray>this.practiceForm?.get('fieldArray')).push(new FormGroup({
//           a: new FormControl(),
//           b: new FormControl()
//     }))

// }

// get controls(){
//   return (<FormArray>this.practiceForm?.get('fieldArray')).controls
// }

submitFields(){
  // console.log('templateName',this.practiceForm.get('inputText')?.value)
  // console.log('fields',this.practiceForm.get('fieldArray')?.value)
}

  uploadedFile: any = [];
  isLoading: boolean = false;
  isWaiting: boolean = false;

  onFileSelected(event : any){
    this.uploadedFile = event.target.files
    document.querySelector('.upload_area')?.classList.add('upload_area_increase_height')
    this.isLoading = true;
    this.isWaiting = true;

    this.extractUniqueRecords()
  }



  duplicate_records = [];
  extractUniqueRecords(){
    
      this.graphdataservice.uploadFiles(this.uploadedFile).subscribe(response => {

      this.isLoading = false;

      let originalrecords = response["original data"]
      let uniquerecords = response["unique data"]

      window.localStorage.setItem("originalrecords", JSON.stringify(originalrecords))
      window.localStorage.setItem("uniquerecords", JSON.stringify(uniquerecords))

      let nodesresponse = response["All Records "]
      this.nodes = Object.keys(nodesresponse).map( key => nodesresponse[key])
 
      localStorage.setItem('nodes', JSON.stringify(this.nodes))

      
      let result = Object.keys(response["Duplicate ids "]).map( key => response["Duplicate ids "][key])

      for( let record of result){
        let eachnode: Duplicaterecords = {
          target: record.rec_id_1,
          source: record.rec_id_2,
        }
  
        this.links.push(eachnode)
      }

      this.links = this.links.map((l : any) => {
        var sourceNode = this.nodes.filter((n : any) =>{
            return n.rec_id === l.source;
        })[0],
            targetNode = this.nodes.filter((n : any) => {
                return n.rec_id === l.target;
            })[0];

        return {
            source: sourceNode.rec_id,
            target: targetNode.rec_id,
            strength: 1
        };
    });

   localStorage.setItem('links', JSON.stringify(this.links))

      this.isWaiting = false;

      localStorage.setItem('isRecordUpdated', 'true')
      this.route.navigate(['/records']
      )
      
    })

  }


}


