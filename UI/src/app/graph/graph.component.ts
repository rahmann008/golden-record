import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3'
import { drag, ForceLink } from 'd3';
import { GraphdataService } from '../services/graphdata.service';
import { UserdetailsService } from '../services/userdetails.service';
import { UtillsService } from '../services/utills.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

  records: any = {}
  nodes: any = []
  links: any = []
  masterRecordToDup : any
  recordsForTable : any
  constructor(private route: Router,
    private userdetail: UserdetailsService,
    private graphservice: GraphdataService,
    private utillservice : UtillsService) {

    this.records = this.route.getCurrentNavigation()?.extras.state

    this.masterRecordToDup = JSON.parse(this.records?.["masterRecord"])
    this.nodes = JSON.parse(this.records?.["nodeEle"])
    this.links = JSON.parse(this.records?.["linkEle"])

    this.recordsForTable = this.nodes
  }


  ngOnInit(): void {

    this.createProfilePicure();
    this.displayNodes()

    this.utillservice.editedsubject.subscribe((res : any) => {
      
      this.nodes = JSON.parse(<any>localStorage.getItem('nodes'))
      this.recordsForTable = this.nodes
      

      d3.selectAll('#name').filter((d: any, i: number) => d.rec_id === res.master.rec_id ).text(res.master.given_name)
      d3.selectAll('#name').each((d: any) => {
        if(d.rec_id === res.master.rec_id){
          d.given_name = res.master.given_name
          d.surname = res.master.surname
          d.street_number = res.master.street_number
          d.address_1 = res.master.address_1
          d.address_2 = res.master.address_2
          d.suburb = res.master.suburb
          d.postcode = res.master.postcode
          d.state = res.master.state
          d.date_of_birth = res.master.date_of_birth
          d.soc_sec_id = res.master.soc_sec_id
        } 
      })

    })
  }

  updateGraph(res : any){

    let idx = this.nodes.findIndex((rec : any) => rec.rec_id === res.master.rec_id)
      if(idx < 0) this.nodes.push(res.master)

      let linkedLinks = [];
      for(let deletedrec of res.deleted){
        let filteredlinks = this.links.filter((rec : any) => rec.source.rec_id === deletedrec.rec_id || rec.target.rec_id === deletedrec.rec_id);
        linkedLinks.push(...filteredlinks)
      }

      
      for(let link of linkedLinks){
        let idx = this.links.findIndex((record : any) => record.source.rec_id === link.source.rec_id && record.target.rec_id === link.target.rec_id)
        if(idx >= 0) this.links.splice(idx, 1)
      }


      d3.select('svg').selectAll('rect').data(this.nodes, (d : any) => d.rec_id).exit().remove()
      d3.select('svg').selectAll('circle').data(this.nodes, (d : any) => d.rec_id).exit().remove()
      d3.select('svg').selectAll('#name').data(this.nodes, (d : any) => d.rec_id).exit().remove()
      d3.select('svg').selectAll('#proficepicture').data(this.nodes, (d : any) => d.rec_id).exit().remove()
      d3.select('svg').selectAll('line').data(this.links, (l : any) => l.source.rec_id + "_" + l.target.rec_id).exit().remove()

  }
  

  getUniqueIds(linkedlinks : any){
    let sourceids = []
    let targetids = []

    for(let link of linkedlinks){
     sourceids.push(link.source.rec_id);
     targetids.push(link.target.rec_id);
   }

   let allids = [...sourceids, ...targetids];
   let alluniqueids = new Set([...allids]);
   
   return alluniqueids
  }


  deleteRelatedLinks(ids : any){
    for(let id of ids){
      let idx = this.links.findIndex((rec : any) => rec.source === id || rec.target === id);
      if(idx >= 0) this.links.splice(idx,1);
    }
  }

  profilepicture: any = {}
  createProfilePicure() {

    for (let node of this.nodes) {
      this.profilepicture[node.given_name] = node.given_name?.[0];
    }

  }

  nodeElements: any;
  textElements: any;
  profilePictureElements: any;
  profileCircle: any;
  linkElements: any;
  svg : any;

  width: any;
  height: any;
  createSvgArea(){
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.svg = d3.selectAll('.graph_area svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'svg_class')

  }

  

  simulation : any;
  createSimulation(){
    this.simulation = d3.forceSimulation(this.nodes)
      .force('charge', d3.forceManyBody().strength(-20))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force("collide", d3.forceCollide().radius((d : any) => 77))

      this.linkElements = this.svg.append('g')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'red')


    this.nodeElements = this.svg.append('g')
      .selectAll('rect')
      .data(this.nodes)
      .enter().append('rect')
      .attr('width', 140)
      .attr('height', 40)
      .attr('class', 'node_style')
      .attr('filter', 'url(#f1)')



    this.textElements = this.svg.append('g')
      .selectAll('text')
      .data(this.nodes)
      .enter().append('text')
      .text((node: any) => node.given_name?.slice(0, 7))
      .attr('font-size', 15)
      .attr('dx', 40)
      .attr('dy', 25)
      .attr('id', 'name')



    this.profileCircle = this.svg.append('g')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', 14)
      .attr('class', 'profile_picture')


    this.profilePictureElements = this.svg.append('g')
      .selectAll('text')
      .data(this.nodes)
      .enter().append('text')
      .text((node: any) => this.profilepicture[node.given_name])
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('dx', 20)
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('id','proficepicture')

  }

  displayNodes() {

    this.createSvgArea();
    this.createSimulation()
      
    this.simulation.nodes(this.nodes).on("tick",
    () => this.ticked())


    this.simulation.force('link', d3.forceLink()
      .id((link: any) => link.rec_id)
      .strength((link: any) => link.strength))


      // simulation.force<ForceLink<any, any>>('link')?.links(this.links);
      this.simulation.force('link')?.links(this.links);

    // // Handling click event on nodes

    this.nodeElements.on("click", (node : any) => {
      this.userdetail.userobject = node.target.__data__
      this.userdetail.userdetails.next(true);
    })


  }


  ticked(){
    this.nodeElements
      .attr("x", (node: any) => node.x)
      .attr("y", (node: any) => node.y)
    this.textElements
      .attr("x", (node: any) => node.x)
      .attr("y", (node: any) => node.y)
    this.profilePictureElements
      .attr("x", (node: any) => node.x)
      .attr("y", (node: any) => node.y)
    this.profileCircle
      .attr("cx", (node: any) => node.x + 20)
      .attr("cy", (node: any) => node.y + 20)
    this.linkElements
      .attr('x1', (link: any) => link.source.x)
      .attr('y1', (link: any) => link.source.y)
      .attr('x2', (link: any) => link.target.x)
      .attr('y2', (link: any) => link.target.y)

  }

  // goBackToRecord(){
  //   this.userdetail.userdetails.next(false)
  //   this.route.navigate(["/records"])
  // }

  ngOnDestroy() {
    this.userdetail.userdetails.next(false)
  }
}
