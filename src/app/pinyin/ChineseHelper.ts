/**
 * 汉字简繁转换
 *
 * @auth superbiger(superbiger@qq.com)
 */
import { PinyinResource } from "./PinyinResource";

let CHINESE_REGEX = /^[\u4e00-\u9fa5]+$/;
let CHINESE_MAP = PinyinResource.getChineseResource();

export class ChineseHelper {
  /**
   * 将单个繁体字转换为简体字
   * @param {string/char} c
   */
  static _convertCharToSimplifiedChinese(c) {
    let simplifiedChinese = CHINESE_MAP[c];
    if(typeof(simplifiedChinese) == "undefined") {
      return c;
    }
    return simplifiedChinese;
  }

  /**
   * 将单个简体字转换为繁体字
   * @param {string/char} c
   */
  static _convertCharToTraditionalChinese(c) {
    for(let key in CHINESE_MAP) {
      if(CHINESE_MAP[key] == c) {
        return key;
      }
    }
    return c;
  }

  /**
   * 将繁体转化为简体
   * @param {string} str
   */
  static convertToSimplifiedChinese(str) {
    let result = '';
    for(let i=0; i < str.length; i++) {
      let c = str.charAt(i);
      result += this._convertCharToSimplifiedChinese(c);
    }
    return result;
  }

  /**
   * 将简体转化为繁体
   * @param {string} str
   */
  static convertToTraditionalChinese(str) {
    let result = '';
    for(let i=0; i < str.length; i++) {
      let c = str.charAt(i);
      result += this._convertCharToTraditionalChinese(c);
    }
    return result;
  }

  /**
   * 判断是否为繁体字
   * @param {string/char} c
   */
  static isTraditionalChinese(c) {
    let val = CHINESE_MAP[c];
    return  typeof(val) != 'undefined'
  }

  /**
   * 判断是否为汉字
   * @param {string/char} c
   */
  static isChinese(c) {
    return '〇' == c || CHINESE_REGEX.test(c)
  }

  /**
   * 是否包含汉字
   * @param {string} str
   */
  static containsChinese(str) {
    for(let i=0; i < str.length; i++) {
      if(this.isChinese(str.charAt(i))){
        return true;
      }
    }
    return false;
  }

  static addChineseDictResource(res) {
    CHINESE_MAP = Object.assign(res, CHINESE_MAP);
  }
}
