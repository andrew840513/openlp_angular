import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {AjaxService} from "../ajax.service";
import * as x2js from "xml-js";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {
  static arr;
  static position = 0;
  _ajaxService:AjaxService;
  currentID = 1;
  xml;
  convert = x2js;
  title;
  constructor(ajaxService:AjaxService, private route: ActivatedRoute) {
    this._ajaxService = ajaxService;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentID = params['id'];
      this.getSong();
    });
    document.addEventListener("keydown",this.keyPress)
  }
  getArr(){
    return DisplayComponent.arr;
  }

  getIndex(){
    return DisplayComponent.position;
  }
  getSong() {
    let url = 'http://localhost:8080/server.php/title,text/custom_slide/id/' + this.currentID;
    this._ajaxService.getData(url).subscribe(
      data => {
        this.title=data['title'];
        let result = this.convert.xml2json(data['text'], {compact: true});
        result = JSON.parse(result);
        let songArray=[];
        for (let verse of result["song"]["lyrics"]["verse"]) {
          songArray = songArray.concat(this.seprateNewLine(verse._cdata));
        }
        DisplayComponent.arr = songArray;
        this.xml = result["song"]["lyrics"]["verse"];
      },
      error => {
        console.log(error);
      },
      () => {
      }
    );
  }

  keyPress(event) {
    let keyCode = event.which || event.keyCode;
    console.log(keyCode);
    if(keyCode == 38 && DisplayComponent.position > 0){
      DisplayComponent.position--;
    }else if(keyCode == 40 &&DisplayComponent.position < DisplayComponent.arr.length-1) {
      DisplayComponent.position++;
    }
    if(keyCode == 27){
      let contextMenu = document.getElementById('contextMenu');
      let songActionMenu = document.getElementById('songActionMenu');
      if(contextMenu){
        contextMenu.style.display = 'none';
      }
      if(songActionMenu){
        songActionMenu.style.display = 'none';
      }
    }
  }

  replaceWithTag(text,tag,htmlTag){
    let startTag = new RegExp('{'+tag+'}',"g");
    let endTag = new RegExp('{/'+tag+'}',"g");
    let newText = text.trim().replace(startTag,'<'+htmlTag+'>')
      .replace(endTag,'</'+htmlTag+'>');
    return newText;
  }
  removeTag(text){
    let regex = new RegExp('{su}|{st}|{/su}|{/st}',"g");
    let newText = text.replace(regex,'');
    return newText;
  }

  seprateNewLine(text){
    let pTag = '<p>';
    let newText = pTag.concat(text.trim().replace(/\n/g,'</p><p>'));
    newText = newText.replace('<p></p>','<span class="newLine"></span>');
    newText = this.replaceWithTag(newText,'su','sub');
    newText = this.replaceWithTag(newText,'st','strong');
    return newText;
  }

  setSelectedRow(index){
    DisplayComponent.position = index;
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

}
