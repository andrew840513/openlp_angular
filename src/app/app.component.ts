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
  constructor(ajaxService: AjaxService, private router:Router) {
    this._ajaxService = ajaxService;
    this.getTitle();
  }

  getTitle() {
    this._ajaxService.getData("http://localhost:8080/server.php/id,title/custom_slide?by=title").subscribe(
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

  //setIndex
  titleOnClick(index) {
    this.selectedRow = index;
  }


  //search
  search(event){
    let keyCode = event.which || event.keyCode;
    if(keyCode == 13){
      this._ajaxService.getData("http://localhost:8080/server.php/id,title/custom_slide/title?like="+this.searchText+"&by=title").subscribe(
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
  }
  //menu cancel
  //menu
  showSongActionMenu(event) {
    let contextMenu = document.getElementById('songActionMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.clientX+5 + 'px';
    contextMenu.style.top = event.clientY+5 + 'px';
    return false;
  }

  hideContextMenu() {
    let contextMenu = document.getElementById('contextMenu');
    let songActionMenu = document.getElementById('songActionMenu');
    if(contextMenu){
      console.log('find contextMenu');
      contextMenu.style.display = 'none';
    }
    if(songActionMenu){
      console.log('find songActionMenu');
      songActionMenu.style.display = 'none';
    }
    console.log('didnt find');
  }

  listenKeys(event) {
    let keyCode = event.which || event.keyCode;
    console.log(keyCode == 27);
    if(keyCode == 27){
      console.log('called function');
      this.hideContextMenu();
    }
  }

  //Redirect to preview
  redirectToPreview(rightClickID){
    this.router.navigate(['./display/'+ rightClickID]);
  }
}
