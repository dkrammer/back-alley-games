//-----------------------------------------------------------------------------
// 2D Fixed Direction (Horizontal)
/*:
 * @plugindesc Only allows player to face left or right (even when moving up or down). Example uses Platformer or Brawler/Beat'em Ups.
 * @author Quasi      Site: http://quasixi.com
 * @help This plugin does not provide plugin commands.
 */
(function() {
  var Alias_Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
  Game_CharacterBase.prototype.setDirection = function(d) {
    if (d === 4 || d === 6) {
      Alias_Game_CharacterBase_setDirection.call(this, d);
    }
  };
}());