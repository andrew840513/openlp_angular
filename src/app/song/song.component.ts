import {Component, OnInit} from '@angular/core';
import {AjaxService} from "../ajax.service";
import {ActivatedRoute, Router} from '@angular/router';
import * as x2js from "xml-js";
import * as PinyinHelper from "../pinyin/PinyinHelper";
import {isUndefined} from "util";

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit {
  _ajaxService: AjaxService;
  currentID;
  xml;
  convert = x2js;

  pinyinHelper = PinyinHelper.PinyinHelper;
  pinyinFormat = PinyinHelper.PinyinFormat;

  constructor(ajaxService: AjaxService, private route: ActivatedRoute, private router:Router) {
    this._ajaxService = ajaxService;
  }

  ngOnInit() {
    if (!this.getSong()) {
      this.newSong();
    }
  }

  newSong() {
    this.xml = {
      title: '',
      text: ''
    }

  }

  getSong() {
    let isGet = false;
    this.route.params.subscribe(params => {
      this.currentID = params['id'];
      if (this.currentID) {
        let url = 'public/server.php/title,text/custom_slide/id/' + this.currentID;
        this._ajaxService.getData(url).subscribe(
          data => {
            if (isUndefined(data['error'])) {
              this.xml = data;
              let result = this.convert.xml2json(data['text'], {compact: true});
              result = JSON.parse(result);
              if(result["song"]["lyrics"]["verse"] instanceof Array) {
                let combineText = "";
                let index = 0;
                for (let verse of result["song"]["lyrics"]["verse"]) {
                  if (verse._cdata == undefined) {
                    verse._cdata = '';
                  }
                  combineText += verse._cdata + "\n";
                  if (result["song"]["lyrics"]["verse"][index + 1]) {
                    combineText += "[===]\n";
                  }

                  index++
                }
                this.xml["text"] = combineText.trim();
              }else{
                this.xml["text"] = result["song"]["lyrics"]["verse"]._cdata;
              }
            }
          },
          error => {
            console.log(error);
          },
          () => {
          }
        );
        isGet = true;
      }
    });
    return isGet;
  }

  updateSong() {
    let url = 'public/server.php/custom_slide/' + this.currentID;
    let payload = {
      title: this.xml.title,
      text: this.compileSong()
    };
    this._ajaxService.putData(url, payload).subscribe(
      data => {
        this.router.navigateByUrl('/display/'+this.currentID);
      },
      error => {
        console.log(error)
      },
      () => {
      }
    )
  }

  createSong() {
    let url = 'public/server.php/custom_slide';
    let payload = {
      title: this.xml.title,
      text: this.compileSong(),
      credits: "",
      theme_name: "Black"
    };

    this._ajaxService.postData(url, payload).subscribe(
      data => {
        let id = data['success']['id'];
        console.log(id);
        this.router.navigateByUrl('/display/'+id);
      },
      error => {
        console.log(error)
      },
      () => {
      }
    );
  }

  compileSong1() {
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

    let hasFirstLine = false;
    for (let split of text) {
      if (!hasFirstLine) {
        concat += split + '\n';
        hasFirstLine = true;
      } else if (split != '[===]') {
        concat += split + '\n';
      } else {
        if (concat != "") {
          let verseArrayTemplate = {
            "_attributes": {
              "label": "",
              "type": "custom"
            },
            "_cdata": ""
          };

          verseArrayTemplate._attributes.label = index.toString();
          verseArrayTemplate._cdata = concat.replace(/\n$/, "").toString();
          template.song.lyrics.verse.push(verseArrayTemplate);
        }
        concat = "";
        index++;
      }
    }
  }

  compileSong(): string {
    let text = this.xml['text'].split("\n");
    let concat = "";
    let index = 1;
    let count = 1;
    let hasContent: boolean = false;
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
      if (split == '[===]' && hasContent) {
        if(count == text.length){
          concat += split + '\n';
        }
        let verseArrayTemplate = {
          "_attributes": {
            "label": "",
            "type": "custom"
          },
          "_cdata": ""
        };

        verseArrayTemplate._attributes.label = index.toString();
        verseArrayTemplate._cdata = concat.replace(/\n$/, "").toString();
        template.song.lyrics.verse.push(verseArrayTemplate);
        concat = "";
        index++;
        hasContent = false;
      } else {
        concat += split + '\n';
        hasContent = true;
      }
      count++;
    }
    if(concat != "") {
      let verseArrayTemplate = {
        "_attributes": {
          "label": "",
          "type": "custom"
        },
        "_cdata": ""
      };

      verseArrayTemplate._attributes.label = index.toString();
      verseArrayTemplate._cdata = concat.replace(/\n$/, "").toString();
      template.song.lyrics.verse.push(verseArrayTemplate);
    }
    return this.convert.json2xml(JSON.stringify(template), {compact: true});
  }

  addPinYin(textComponent) {
    if (textComponent.selectionStart !== undefined) {// Standards Compliant Version
      let selected = SongComponent.getSelectedText(textComponent);
      if (selected.trim() != '') {
        textComponent.focus();
        let text = selected + '\n{su}' + this.pinyinHelper.convertToPinyinString(selected, ' ', this.pinyinFormat.WITHOUT_TONE) + '{/su}';
        document.execCommand("insertText", false, text);
      }
    }
  }

  addTag(textComponent, text) {
    let startTag = '{' + text + '}';
    let endTag = '{/' + text + '}';
    if (textComponent.selectionStart !== undefined) {// Standards Compliant Version
      let selected = SongComponent.getSelectedText(textComponent);
      if (selected.trim() != '') {
        textComponent.focus();
        document.execCommand("insertText", false, startTag + selected.trim() + endTag);
      }
    }
  }

  insertAtCursor(textComponent) {
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
    contextMenu.style.left = event.clientX + 5 + 'px';
    contextMenu.style.top = event.clientY + 5 + 'px';
    return false;
  }

  hideContextMenu() {
    let contextMenu = document.getElementById('contextMenu');
    let songActionMenu = document.getElementById('songActionMenu');
    if (contextMenu) {
      contextMenu.style.display = 'none';
    }
    if (songActionMenu) {
      songActionMenu.style.display = 'none';
    }
  }

  listenKeys(event) {
    let keyCode = event.which || event.keyCode;
    if (keyCode == 27) {
      let contextMenu = document.getElementById('contextMenu');
      let songActionMenu = document.getElementById('songActionMenu');
      if (contextMenu) {
        contextMenu.style.display = 'none';
      }
      if (songActionMenu) {
        songActionMenu.style.display = 'none';
      }
    }
  }

}
