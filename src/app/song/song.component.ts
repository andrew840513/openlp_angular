import {Component, OnInit} from '@angular/core';
import {AjaxService} from "../ajax.service";
import {ActivatedRoute, Params}       from '@angular/router';
import * as x2js from "xml-js";
import * as PinyinHelper from "../pinyin/PinyinHelper";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit{
  _ajaxService:AjaxService;
  currentID;
  xml: string[];
  convert = x2js;

  pinyinHelper = PinyinHelper.PinyinHelper;
  pinyinFormat = PinyinHelper.PinyinFormat;

  constructor(ajaxService: AjaxService,private route: ActivatedRoute) {
    this._ajaxService = ajaxService;
    this.route.params.forEach((params: Params) => {
      this.currentID = params['id'];
    });
    this.getSong();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentID = params['id'];
      this.getSong();
    });
  }

  getSong() {
    let url = 'http://localhost:8080/server.php/title,text/custom_slide/id/' + this.currentID;
    this._ajaxService.getData(url).subscribe(
      data => {
        this.xml = data;
        let result = this.convert.xml2json(data['text'], {compact: true});
        result = JSON.parse(result);
        let combineText = "";
        let index = 0;
        for (let verse of result["song"]["lyrics"]["verse"]) {
          combineText += verse._cdata + "\n";
          if (result["song"]["lyrics"]["verse"][index + 1]) {
            combineText += "[===]\n";
          }
          index++
        }
        this.xml["text"] = combineText.trim();
      },
      error => {
        console.log(error);
      },
      () => {
      }
    );
  }

  updateSong() {
    let url = 'http://localhost:8080/server.php/custom_slide/' + this.currentID;
    let payload = {
      text: this.compileSong()
    };
    this._ajaxService.putData(url, payload).subscribe(
      data => {
      },
      error => {
        console.log(error)
      },
      () => {
      }
    )
  }

  compileSong(): string {
    let text = this.xml['text'].split("\n");
    let concat = "";
    let index = 1;
    let template = {
      "_declaration": {
        "_attributes": {
          "version": "1.0",
          "encoding": "utf-8"
        }
      },
      "song": {
        "_attributes": {
          "version": "1.0"
        },
        "lyrics": {
          "_attributes": {
            "language": "en"
          },
          "verse": []
        }
      }
    };

    for (let split of text) {
      if (split != '[===]') {
        concat += split + '\n';
      } else {
        let verseArrayTemplate = {
          "_attributes": {
            "label": "",
            "type": "custom"
          },
          "_cdata": ""
        };

        verseArrayTemplate._attributes.label = index.toString();
        verseArrayTemplate._cdata = concat.replace(/\n$/, "");
        template.song.lyrics.verse.push(verseArrayTemplate);
        concat = "";
        index++;
      }
    }

    let verseArrayTemplate = {
      "_attributes": {
        "label": "",
        "type": "custom"
      },
      "_cdata": ""
    };

    verseArrayTemplate._attributes.label = index.toString();
    verseArrayTemplate._cdata = concat.replace(/\n$/, "");
    template.song.lyrics.verse.push(verseArrayTemplate);

    return this.convert.json2xml(JSON.stringify(template), {compact: true});
  }

  addPinYin(textComponent) {
    if (textComponent.selectionStart !== undefined) {// Standards Compliant Version
      let selected = SongComponent.getSelectedText(textComponent);
      if(selected.trim() != ''){
        textComponent.focus();
        let text = selected+'\n{su}' + this.pinyinHelper.convertToPinyinString(selected, ' ', this.pinyinFormat.WITHOUT_TONE)+'{/su}';
        document.execCommand("insertText", false, text);
      }
    }
  }

  addTag(textComponent, text){
    let startTag = '{'+text+'}';
    let endTag = '{/'+text+'}';
    if (textComponent.selectionStart !== undefined) {// Standards Compliant Version
      let selected = SongComponent.getSelectedText(textComponent);
      if(selected.trim() != ''){
        textComponent.focus();
        document.execCommand("insertText", false, startTag+ selected.trim() + endTag);
      }
    }
  }

  insertAtCursor(textComponent){
    textComponent.focus();
    document.execCommand("insertText", false, '[===]');
  }

  private static getSelectedText(textComponent) {
    let selectedText;
    let startPos = textComponent.selectionStart;
    let endPos = textComponent.selectionEnd;

    selectedText = textComponent.value.substring(startPos, endPos);

    return selectedText;
  }

  //menu
  showContextMenu(event) {
    let contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.clientX+5 + 'px';
    contextMenu.style.top = event.clientY+5 + 'px';
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

}
