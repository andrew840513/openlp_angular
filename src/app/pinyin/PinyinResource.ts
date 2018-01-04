import {chinese_dict} from "./dict/chinese.dict.js";
import {mutil_pinyin_dict} from "./dict/multi_pinyin.dict";
import {pinyin_dict} from "./dict/pinyin.dict.js";

export class PinyinResource {
  //单字拼音字典库
  static getPinyinResource() {
    return pinyin_dict;
  }
  //词组拼音字典库
  static getMutilPinyinResource() {
    return mutil_pinyin_dict;
  }
  //简繁对照库
  static getChineseResource() {
    return chinese_dict;
  }
}
