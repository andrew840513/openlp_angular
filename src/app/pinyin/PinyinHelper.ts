/**
 * 汉字转拼音
 *
 * @auth superbiger(superbiger@qq.com)
 */
import { PinyinResource } from "./PinyinResource"
import { ChineseHelper } from "./ChineseHelper"

export let PinyinFormat = {
  WITH_TONE_MARK      :"WITH_TONE_MARK",   //带声调
  WITHOUT_TONE        :"WITHOUT_TONE",     //不带声调
  WITH_TONE_NUMBER    :"WITH_TONE_NUMBER", //数字代表声调
  FIRST_LETTER        :"FIRST_LETTER"      //首字母风格
};

let PINYIN_TABLE = PinyinResource.getPinyinResource();  //单字字典
let MUTIL_PINYIN_TABLE = PinyinResource.getMutilPinyinResource();  //词组字典
let PINYIN_SEPARATOR = ","; //拼音分隔符
let CHINESE_LING = '〇';
let ALL_UNMARKED_VOWEL = "aeiouv";
let ALL_MARKED_VOWEL = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ"; //所有带声调的拼音字母

export class PinyinHelper {
  /**
   * 将带声调格式的拼音转换为数字代表声调格式的拼音
   * @param {string/char} str
   */
  static _convertWithToneNumber(str) {
    let pinyinArray = str.split(PINYIN_SEPARATOR);

    for(let i=pinyinArray.length -1; i >=0; i--) {
      let hasMarkedChar = false;
      let originalPinyin = pinyinArray[i].replace("ü", "v");

      for(let j=originalPinyin.length - 1; j >= 0; j--) {
        let originalChar = originalPinyin.charAt(j);
        if(originalChar < 'a' || originalChar > 'z') {
          let indexInAllMarked = ALL_MARKED_VOWEL.indexOf(originalChar);
          let toneNumber = indexInAllMarked % 4 + 1;
          let replaceChar = ALL_UNMARKED_VOWEL.charAt((indexInAllMarked - indexInAllMarked % 4) / 4);

          pinyinArray[i] = originalPinyin.replace(originalChar, replaceChar) + toneNumber;
          hasMarkedChar = true;
          break;
        }
      }
      if(!hasMarkedChar) {
        // 找不到带声调的拼音字母说明是轻声，用数字5表示
        pinyinArray[i] = originalPinyin + "5";
      }
    }
    return pinyinArray;
  }

  /**
   * 将带声调格式的拼音转换为不带声调格式的拼音
   * @param {string/char} str
   */
  static _convertWithoutTone(str) {
    let pinyinArray;
    for(let i = ALL_MARKED_VOWEL.length - 1; i >= 0; i--) {
      let originalChar = ALL_MARKED_VOWEL.charAt(i);
      let replaceChar = ALL_UNMARKED_VOWEL.charAt((i - i % 4) / 4);
      str = str.replace(originalChar, replaceChar);
    }
    pinyinArray = str.replace("ü", "v").split(PINYIN_SEPARATOR);
    return pinyinArray;
  }

  /**
   * 将带声调的拼音格式化为相应格式的拼音
   * @param {string/char} str
   * @param {PinyinFormat} format 拼音格式：WITH_TONE_NUMBER--数字代表声调，WITHOUT_TONE--不带声调，WITH_TONE_MARK--带声调
   */
  static _formatPinyin(str, format) {
    if (format == PinyinFormat.WITH_TONE_MARK) {
      return str.split(PINYIN_SEPARATOR);
    } else if (format == PinyinFormat.WITH_TONE_NUMBER) {
      return this._convertWithToneNumber(str);
    } else if (format == PinyinFormat.WITHOUT_TONE) {
      return this._convertWithoutTone(str);
    } else if (format == PinyinFormat.FIRST_LETTER) {
      return this._convertWithoutTone(str);
    }
    return [];
  }

  /**
   * 将单个汉字转换为相应格式的拼音
   *
   * @param {string/char} c
   * @param {PinyinFormat} format 拼音格式：WITH_TONE_NUMBER--数字代表声调，WITHOUT_TONE--不带声调，WITH_TONE_MARK--带声调
   */
  static _convertToPinyinArray(c, format) {
    let pinyin = PINYIN_TABLE[c];
    if(typeof(pinyin) != "undefined") {
      let arr = [];
      let pinyinArray = this._formatPinyin(pinyin, format);
      for(let i = 0; i < pinyinArray.length; i++){
        arr.push(pinyinArray[i]);
      }
      return arr;
    }
    return [];
  }

  /**
   * 获取给定字符串是否在字典中找到词组拼音对应关系
   *
   * 简化操作 暂时只支持6字以内字典检测
   * @param {string} str
   */
  static _getWords(str) {
    for(let i = 1; i < 6; i++) {
      let temp = MUTIL_PINYIN_TABLE[str.substring(0, i)];
      if(typeof(temp) != 'undefined'){
        return [str.substring(0, i)];
      }
    }
    return [];
  }

  /**
   * 将字符串转换成相应格式的拼音
   * @param {string} str
   * @param {string} separator
   * @param {PinyinFormat} format 拼音格式：WITH_TONE_NUMBER--数字代表声调，WITHOUT_TONE--不带声调，WITH_TONE_MARK--带声调
   */
  static convertToPinyinString(str, separator, format) {
    str = ChineseHelper.convertToSimplifiedChinese(str);
    let i = 0;
    let strLen = str.length;
    let str_result = '';
    while(i < strLen) {
      let subStr = str.substring(i);
      let commonPrefixList = this._getWords(subStr); //词组字典有的情况返回该起点下分词数组，没有的情况返回空数组

      if(commonPrefixList.length == 0) { //不是词组
        let c = str.charAt(i);
        if(ChineseHelper.isChinese(c) || c == CHINESE_LING) {
          let pinyinArray = this._convertToPinyinArray(c, format);
          if(pinyinArray.length > 0) {
            if(format == PinyinFormat.FIRST_LETTER){
              str_result += pinyinArray[0].charAt(0);
            }else{
              str_result += pinyinArray[0];
            }
          }else{
            str_result += str.charAt(i)
          }
        } else {
          str_result += c;
        }
        i++;
      } else { //是词组
        let words = commonPrefixList[commonPrefixList.length - 1];
        let pinyinArray = this._formatPinyin(MUTIL_PINYIN_TABLE[words], format);
        for(let j=0, l = pinyinArray.length; j < l; j++) {
          if(format == PinyinFormat.FIRST_LETTER){
            str_result += pinyinArray[j].charAt(0);
          }else{
            str_result += pinyinArray[j];
          }
          if(j < l - 1) {
            str_result += separator
          }
        }
        i += words.length;
      }
      if( i < strLen && ChineseHelper.isChinese(str.charAt(i-1))) {
        str_result += separator;
      }
    }
    return str_result;
  }

  /**
   * 获取字符串对应拼音的首字母
   * @param {string} str
   */
  static getShortPinyin(str) {
    return this.convertToPinyinString(str, '', PinyinFormat.FIRST_LETTER);
  }

  /**
   * 判断一个汉字是否为多音字
   * @param {string/char} c
   */
  static hasMultiPinyin(c) {
    let pinyin = PINYIN_TABLE[c];
    if(typeof(c) != 'undefined'){
      return pinyin.split(',').length > 1
    }
    return false;
  }

  static addPinyinDictResource(res) {
    PINYIN_TABLE = Object.assign(res, PINYIN_TABLE);
  }

  static addMutilPinyinDictResource(res) {
    MUTIL_PINYIN_TABLE = Object.assign(res, MUTIL_PINYIN_TABLE);
  }
}
