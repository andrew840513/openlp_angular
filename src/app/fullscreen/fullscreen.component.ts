import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-fullscreen',
  templateUrl: './fullscreen.component.html',
  styleUrls: ['./fullscreen.component.css']
})
export class FullscreenComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {

  }

  full_screen() {
    if ('fullscreenEnabled' in document || 'webkitFullscreenEnabled' in document) {
      if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
        console.log('User allows fullscreen');

        const element = document.getElementById('display');
        // requestFullscreen is used to display an element in full screen mode.
        if ('requestFullscreen' in element) {
          element.requestFullscreen();
        } else if ('webkitRequestFullscreen' in element) {
          element.webkitRequestFullscreen();
        }
      }
    } else {
      console.log('User doesn\'t allow full screen');
    }
  }
}
