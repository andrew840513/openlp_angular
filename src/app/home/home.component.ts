import { Component, OnInit } from '@angular/core';
import {AjaxService} from "../ajax.service";
import * as x2js from "xml-js";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentID = 1;
  convert = x2js;
  data:Data = {
    title: '',
    preview: [],
    display: [],
    edit: ''
  };
  index;
  constructor(private _ajaxService:AjaxService) {
    this.getSong();
  }

  ngOnInit() {
  }

  getSong() {
    let url = 'public/server.php/title,text/custom_slide/id/' + this.currentID;
    this._ajaxService.getData(url).subscribe(
      data => {
        let result = this.convert.xml2json(data['text'], {compact: true});
        result = JSON.parse(result);
        this.data = {
          title: data['title'],
          preview: this.getPreview(result),
          display: this.getDisplay(result),
          edit: this.getEdit(result)
        };
      },
      error => {
        console.log(error);
      },
      () => {
      }
    );
  }

  //Preview
  getPreview(data){
    let song;
    let preview = [];
    if(data["song"]["lyrics"]["verse"] instanceof Array){
      song = data["song"]["lyrics"]["verse"];
    }else{
      song = [{'_cdata':data["song"]["lyrics"]["verse"]._cdata}];
    }
    for(let i = 0; i < song.length ; i++){
      preview[i] = this.removeTag(song[i]._cdata);
    }
    return preview;
  }

  setIndex(index){
    this.index = index;
  }
  //display
  getDisplay(data){
    let songArray=[];
    if(data["song"]["lyrics"]["verse"] instanceof Array){
      for (let verse of data["song"]["lyrics"]["verse"]) {
        if(verse._cdata == undefined){
          verse._cdata = '';
        }
        songArray = songArray.concat(this.seprateNewLine(verse._cdata));
      }
    }else{
      songArray = songArray.concat(this.seprateNewLine(data["song"]["lyrics"]["verse"]._cdata,true));
    }
    return songArray;
  }

  //Edit
  getEdit(data){
    if(data["song"]["lyrics"]["verse"] instanceof Array) {
      let combineText = "";
      let index = 0;
      for (let verse of data["song"]["lyrics"]["verse"]) {
        if (verse._cdata == undefined) {
          verse._cdata = '';
        }
        combineText += verse._cdata + "\n";
        if (data["song"]["lyrics"]["verse"][index + 1]) {
          combineText += "[===]\n";
        }
        index++
      }
      return  combineText.trim();
    }else{
      return data["song"]["lyrics"]["verse"]._cdata;
    }
  }


  //menu
  showContextMenu(event) {
    let contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.clientX +5+ 'px';
    contextMenu.style.top = event.clientY +5+ 'px';
    console.log("X: "+event.clientX+" Y:"+ event.clientY);
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
    console.log(keyCode == 27);
    if(keyCode == 27){
      this.hideContextMenu();
    }
  }

  private removeTag(text){
    if(text) {
      let regex = new RegExp('{su}|{st}|{/su}|{/st}', "g");
      let newText = text.replace(regex, '');
      return newText;
    }else{
      return '';
    }
  }

  private seprateNewLine(text, onlyOneLine = false){
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

  private replaceWithTag(text,tag,htmlTag){
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
}

export interface Data{
  title: string;
  preview: string[];
  display: string[];
  edit: string;
}
