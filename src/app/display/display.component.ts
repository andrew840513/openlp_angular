import {Component, OnInit} from '@angular/core';
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
    let url = 'public/server.php/title,text/custom_slide/id/' + this.currentID;
    this._ajaxService.getData(url).subscribe(
      data => {
        this.title=data['title'];
        let result = this.convert.xml2json(data['text'], {compact: true});
        let songArray=[];
        result = JSON.parse(result);
        if(result["song"]["lyrics"]["verse"] instanceof Array){
          for (let verse of result["song"]["lyrics"]["verse"]) {
            if(verse._cdata == undefined){
              verse._cdata = '';
            }
            songArray = songArray.concat(this.seprateNewLine(verse._cdata));
          }
          this.xml = result["song"]["lyrics"]["verse"];
        }else{
          songArray = songArray.concat(this.seprateNewLine(result["song"]["lyrics"]["verse"]._cdata,true));
          this.xml = [{'_cdata':result["song"]["lyrics"]["verse"]._cdata}];
        }
        DisplayComponent.arr = songArray;
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
    if(text != '') {
      let newText = text.replace(startTag, '<' + htmlTag + '>')
        .replace(endTag, '</' + htmlTag + '>');
      return newText;
    }else{
      return '';
    }
  }
  removeTag(text){
    if(text) {
      let regex = new RegExp('{su}|{st}|{/su}|{/st}', "g");
      let newText = text.replace(regex, '');
      return newText;
    }else{
      return '';
    }
  }

  seprateNewLine(text, onlyOneLine = false){
    let pTag = '<p>';
    text = this.replaceWithTag(text,'su','sub');
    text = this.replaceWithTag(text,'st','strong');
    let subString = text.match(/<sub>[\s\S]*?<\/sub>/g);
    text = text.replace(/<sub>[\s\S]*?<\/sub>/g,'~');
    if(subString){
      for(let i = 0; i < subString.length ; i++){
        text = text.replace('~',subString[i].replace('\n','<br>'));
      }
    }


    let newText = pTag.concat(text.replace(/\n/g,'</p><p>'));
    newText = newText.replace('<p></p>','<span class="newLine"></span>');
    if(onlyOneLine){
      newText = newText.concat('</p>');
    }
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
