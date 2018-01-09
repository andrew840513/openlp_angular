import {Component} from '@angular/core';
import {AjaxService} from "./ajax.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AjaxService]
})
export class AppComponent {
  data: string[];
  selectedRow: Number;
  searchText='';
  //import
  _ajaxService: AjaxService;
  rightClickID;
  constructor(ajaxService: AjaxService, private router:Router) {
    this._ajaxService = ajaxService;
    this.getTitle();
  }

  getTitle() {
    this._ajaxService.getData("public/server.php/id,title/custom_slide?by=title").subscribe(
      data => {
        this.data = data;
      },
      error => {
        console.log(error);
      },
      () => {
      }
    );
  }

  deleteSong(){
    let url = 'public/server.php/custom_slide/'+this.rightClickID;
    this._ajaxService.deleteData(url).subscribe(
      data =>{
        this.getTitle();
      },
      error=>{
        console.log(error)
      },()=>{
      }
    )
  }

  //setIndex
  titleOnClick(index) {
    this.selectedRow = index;
  }


  //search
  search(){
    let table = document.getElementById('searchTable');
    let tr = table.getElementsByTagName('tr');
    let filter = this.searchText.toUpperCase();
    for(let i =0; i< tr.length; i++){
      let td = tr[i].getElementsByTagName('td')[0];
      if(td){
        if(td.innerHTML.toUpperCase().indexOf(filter) > -1){
          tr[i].style.display = "";
        }else{
          tr[i].style.display = "none";
        }
      }
    }
  }
  //menu cancel
  //menu
  showSongActionMenu(event,id) {
    let contextMenu = document.getElementById('songActionMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.clientX+5 + 'px';
    contextMenu.style.top = event.clientY+5 + 'px';
    this.rightClickID = id;
    return false;
  }

  hideContextMenu() {
    let contextMenu = document.getElementById('contextMenu');
    let songActionMenu = document.getElementById('songActionMenu');
    if(contextMenu){
      contextMenu.style.display = 'none';
    }
    if(songActionMenu){
      songActionMenu.style.display = 'none';
    }
  }

  listenKeys(event) {
    let keyCode = event.which || event.keyCode;
    if(keyCode == 27){
      this.hideContextMenu();
    }
  }

  //Redirect to preview
  redirectToPreview(rightClickID){
    this.router.navigate(['./display/'+ rightClickID]);
  }
}
