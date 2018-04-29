import {Component, OnInit} from '@angular/core';
import {AjaxService} from '../ajax.service';
import * as x2js from 'xml-js';
import {ActivatedRoute} from '@angular/router';
import {element} from 'protractor';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
  arr;
  position = 0;
  _ajaxService: AjaxService;
  currentID = 1;
  xml;
  convert = x2js;
  title;

  constructor(ajaxService: AjaxService, private route: ActivatedRoute) {
    this._ajaxService = ajaxService;
    this.keyPress = this.keyPress.bind(this);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentID = params['id'];
      this.getSong();
      this.position = 0;
    });
    document.addEventListener('keydown', this.keyPress);
  }

  getIndex() {
    return this.position;
  }

  getSong() {
    const url = 'public/server.php/title,text/custom_slide/id/' + this.currentID;
    this._ajaxService.getData(url).subscribe(
      data => {
        this.title = data['title'];
        let result = this.convert.xml2json(data['text'], {compact: true});
        let songArray = [];
        result = JSON.parse(result);
        for (const verse of result['song']['lyrics']['verse']) {
          if (verse._cdata === undefined) {
            verse._cdata = '';
          }
          songArray = songArray.concat(this.seprateNewLine(verse._cdata));
        }
        this.xml = result['song']['lyrics']['verse'];
        this.arr = songArray;
      },
      error => {
        console.log(error);
      },
      () => {
      }
    );
  }

  keyPress(event) {
    const keyCode = event.which || event.keyCode;
    if (keyCode === 38 && this.position > 0) {
      this.position--;
    } else if (keyCode === 40 && this.position < this.arr.length - 1) {
      this.position++;
    }
    if (keyCode === 27) {
      const contextMenu = document.getElementById('contextMenu');
      const songActionMenu = document.getElementById('songActionMenu');
      if (contextMenu) {
        contextMenu.style.display = 'none';
      }
      if (songActionMenu) {
        songActionMenu.style.display = 'none';
      }
    }
    return false;
  }

  replaceWithTag(text, tag, htmlTag) {
    const startTag = new RegExp('{' + tag + '}', 'g');
    const endTag = new RegExp('{/' + tag + '}', 'g');
    if (text !== '') {
      text = text.replace(startTag, '<' + htmlTag + '>')
        .replace(endTag, '</' + htmlTag + '>');
      return text;
    } else {
      return '';
    }
  }

  removeTag(text) {
    if (text) {
      const regex = new RegExp('{su}|{st}|{/su}|{/st}', 'g');
      const newText = text.replace(regex, '');
      return newText;
    } else {
      return '';
    }
  }

  seprateNewLine(text) {
    const split = text.split('\n');
    let rebuild;
    for (let i = 0; i < split.length; i++) {
      split[i] = split[i].trim();
    }
    rebuild = split.join().replace(/,/g, '\n');
    text = rebuild.replace(/\n/g, '<br>');
    text = this.replaceWithTag(text, 'su', 'sup');
    text = this.replaceWithTag(text, 'st', 'strong');
    return text;
  }

  setSelectedRow(index) {
    this.position = index;
  }

  hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    const songActionMenu = document.getElementById('songActionMenu');
    if (contextMenu) {
      contextMenu.style.display = 'none';
    }
    if (songActionMenu) {
      songActionMenu.style.display = 'none';
    }
  }

  full_screen() {
    if ('fullscreenEnabled' in document || 'webkitFullscreenEnabled' in document) {
      if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
        console.log('User allows fullscreen');

        const display = document.getElementById('display');
        // requestFullscreen is used to display an element in full screen mode.
        if ('requestFullscreen' in display) {
          display.requestFullscreen();
        } else if ('webkitRequestFullscreen' in display) {
          display.webkitRequestFullscreen();
        }
      }
    } else {
      console.log('User doesn\'t allow full screen');
    }
  }

}
