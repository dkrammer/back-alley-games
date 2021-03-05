/*=============================================================================
 * CTB SaveEx
 * By CT_Bolt
 * CTB_SaveEx.js
 * Version: 1.00
 * Terms of Use:
 *   Free for commercial and non commercial use in projects.
 *   Enjoy! Happy Game Making!
 *
/*=============================================================================*/

var CTB = CTB || {};
CTB.saveEx  = CTB.saveEx || {};

var Imported = Imported || {};
Imported["CT_Bolt SaveEx"] = 1.00;

//=============================================================================
/*:
 * @plugindesc CT_Bolt's SaveEx Plugin v1.00
 * @author CT_Bolt
 *
 * @help
 *
 * CT_Bolt's SaveEx
 * Version 1.00
 * CT_Bolt
 *
 * ***************** Description **********************
 * Right now all it does is replace character sprites with face sprites
 *
 * ****************** How to Use **********************
 * Plug & Play :)
 *
 * History Log:
 *    v1.00 Initial Release (1/20/2020)
 */


"use strict";
(function ($) {
  function getPluginParameters() {var a = document.currentScript || (function() { var b = document.getElementsByTagName('script'); return b[b.length - 1]; })(); return PluginManager.parameters(a.src.substring((a.src.lastIndexOf('/') + 1), a.src.indexOf('.js')));} $.Param = getPluginParameters();

  // Overwrite
  Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
      var bottom = rect.y + rect.height;
      if (rect.width >= 420) {
          this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
          if (valid) {
              this.drawPartyFaces(info, rect.x + 220, bottom - 4-48);
          }
      }
      var lineHeight = this.lineHeight();
      var y2 = bottom - lineHeight;
      if (y2 >= lineHeight) {
          this.drawPlaytime(info, rect.x, y2, rect.width);
      }
  };

  // New
  Window_SavefileList.prototype.drawPartyFaces = function(info, x, y) {
      if (info.characters) {
          for (var i = 0; i < info.characters.length; i++) {
              var data = info.faces[i];
              this.drawFaceForSave(data[0], data[1], x + i * 48, y, 144, 144, 48, 48);
          }
      }
  };

  // New
  Window_SavefileList.prototype.drawFaceForSave = function(faceName, faceIndex, x, y, width, height, dw, dh) {
      width = width || Window_Base._faceWidth;
      height = height || Window_Base._faceHeight;
      var bitmap = ImageManager.loadFace(faceName);
      var pw = Window_Base._faceWidth;
      var ph = Window_Base._faceHeight;
      var sw = Math.min(width, pw);
      var sh = Math.min(height, ph);
      
      dw = dw || sw;
      dh = dh || sh;
  
      var dx = Math.floor(x)
      var dy = Math.floor(y);
  
      var sx = faceIndex % 4 * pw + (pw - sw) / 2;
      var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
      this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
  };
})(CTB.saveEx);