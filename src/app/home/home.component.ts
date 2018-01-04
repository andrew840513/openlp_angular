import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
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
}
