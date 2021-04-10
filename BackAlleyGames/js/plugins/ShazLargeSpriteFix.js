/*:
* @plugindesc Fixes issue with large sprites appearing over ☆ passability tiles
* @author Shaz - rewrite of Neon Black's plugin
*
* @param Terrain Id
* @desc This is the ID of the terrain to fix with ☆ tiles
* @default 7
*
* @param Apply to Followers
* @desc Enable this option to perform large sprite checking on followers
* @default N
*
* @param Apply to Vehicles
* @desc Enable this option to perform large sprite checking on vehicles
* @default Y
*
* @param Apply to All Events
* @desc Enable this option to perform large sprite checking on ALL events
* @default N
*
* @help
*
* This plugin is a rewrite to fix some issues with Neon Black's Large Sprite
* Fix plugin.  By default, tiles with a star passability appear in front of
* character sprites, based on the assumption that character sprites will
* follow MV's default size of 48x48 pixels.  This causes a problem when
* sprites are larger, or are drawn higher than the grid, and may be partially
* chopped off by the tile.
*
* Tiles marked with the specified terrain tag and a star passage setting will
* only appear above the character sprite when the character is at the same
* y coordinate, or higher, than the tile.  If the character is lower than the
* tile, the character will appear in front.
*
* To perform large sprite checking only on specific events, set the Apply to
* All Events parameter to N, and add a plugin call on each event page where
* the effect is to be applied:
*   LargeSprite
* To maintain compatibility with Neon Black's previous plugin, you can also
* use the tag <large sprite> in a comment box on an event.
*/

(function() {

  var parameters = PluginManager.parameters('ShazLargeSpriteFix');
  var terrainId = Number(parameters['Terrain Id'] || 7);
  var lsFollowers = (parameters['Apply to Followers'] || 'N').toUpperCase().substring(0,1) === 'Y';
  var lsVehicles = (parameters['Apply to Vehicles'] || 'N').toUpperCase().substring(0,1) === 'Y';
  var lsAllEvents = (parameters['Apply to All Events'] || 'N').toUpperCase().substring(0,1) === 'Y';

  Game_CharacterBase.prototype.largeSprite = function() { return false };
  Game_Player.prototype.largeSprite = function() { return true };
  Game_Follower.prototype.largeSprite = function() { return lsFollowers };
  Game_Vehicle.prototype.largeSprite = function() { return lsVehicles };
  Game_Event.prototype.largeSprite = function() { return lsAllEvents || this._largeSprite };

  var _Game_Event_setupPage = Game_Event.prototype.setupPage;
  Game_Event.prototype.setupPage = function() {
    _Game_Event_setupPage.call(this);
    this._largeSprite = this.list().some(function(cmd) {
      return (cmd.code === 356 && cmd.parameters[0].split(' ').shift().toUpperCase() === 'LARGESPRITE') ||
      ([108,408].indexOf(cmd.code) > -1 && cmd.parameters[0].match(/<large sprite>/i));
    });
  };

  var _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup.call(this, mapId);
    this.setupLargeSpriteTiles();
  };

  Game_Map.prototype.setupLargeSpriteTiles = function() {
    this._largeSpriteTiles = [];
    var flags = this.tilesetFlags();
    for (var x = 0; x < $dataMap.width; x++) {
      for (var y = 0; y < $dataMap.height; y++) {
        var tiles = this.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
          var flag = flags[tiles[i]];
          if ((flag & 0x10) !== 0 && (flag >> 12) === terrainId) {
            this._largeSpriteTiles.push([x,y]);
            break;
          }
        }
      }
    }
  };

  Game_Map.prototype.largeSpriteTiles = function(x1, y1, x2, y2) {
    return this._largeSpriteTiles.filter( function(key) {
      return key[0] >= x1 && key[0] <= x2 && key[1] >= y1 && key[1] <= y2;
    });
  };

  var _Sprite_Character_update = Sprite_Character.prototype.update;
  Sprite_Character.prototype.update = function() {
    if (this.isImageChanged()) {
      this._characterSpriteChanged = true;
    }
    _Sprite_Character_update.call(this);
    this.updateUpperSprite();
  };

  Sprite_Character.prototype.updateUpperSprite = function () {
    if (this._character.largeSprite() && this._tileId === 0 && this.bitmap.isReady()) {
      if (this._characterSpriteChanged) {
        this.saveBitmap();
      }
      this.getMapInfo();
      this.getEdgeRect();
      if (this.isOnScreenCharacter()) {
        this.getEdgeTiles();
        this.overlayTiles = $gameMap.largeSpriteTiles(this.edgeTiles[0], this.edgeTiles[1],
          this.edgeTiles[2], this.edgeTiles[3] - 1);
        this.refreshBitmap();
      }
    }
  };

  Sprite_Character.prototype.saveBitmap = function() {
    this._characterSpriteChanged = false;
    frame = new Rectangle(this._frame.x, this._frame.y, this._frame.width, this._frame.height);
    this.oldBitmap = new Bitmap(this.bitmap.width, this.bitmap.height);
    this.oldBitmap.blt(this.bitmap, 0, 0, this.bitmap.width, this.bitmap.height, 0, 0);
    this.bitmap = new Bitmap(this.bitmap.width, this.bitmap.height);
    this.bitmap.blt(this.oldBitmap, 0, 0, this.bitmap.width, this.bitmap.height, 0, 0);
    this.setFrame(frame.x, frame.y, frame.width, frame.height);
    if (this._upperSprite) {
      this._upperSprite.bitmap = new Bitmap(this.patternWidth(), this.patternHeight());
    }
  };

  Sprite_Character.prototype.refreshBitmap = function() {
    if (this._upperSprite) {
      this.bitmap.clearRect(0, 0, this.bitmap.width, this.bitmap.height);
      this.bitmap.blt(this.oldBitmap, 0, 0, this.bitmap.width, this.bitmap.height, 0, 0);
    }
    if (this.overlayTiles.length > 0) {
      this.createUpperSprite();
      this._upperSprite.bitmap.clear();
      this._upperSprite.visible = this.visible;
      this._upperSprite.opacity = this.opacity;
      this._upperSprite.x = this.x;
      this._upperSprite.y = this.y;
      this._upperSprite.z = 8;
      this._upperSprite.setBlendColor(this.getBlendColor());
      this._upperSprite.setColorTone(this.getColorTone());
      this.copyOverlaySegments();
    } else if (this._upperSprite) {
      this._upperSprite.visible = false;
    }
  };

  Sprite_Character.prototype.copyOverlaySegments = function() {
    var pw = this.patternWidth();
    var ph = this.patternHeight();
    for (var x = 0; x < pw; ) {
      for (var y = 0; y < ph; ) {
        var w = Math.min(pw - x, this.tw - (this.mx + this.edge[0] + x) % this.tw);
        var h = Math.min(ph - y, this.th - (this.my + this.edge[1] + y) % this.th);
        if (this.isOverlaySegment(x, y)) {
          this._upperSprite.bitmap.blt(this.bitmap, this._frame.x + x, this._frame.y + y, w, h, x, y, w, h);
          this.bitmap.clearRect(this._frame.x + x, this._frame.y + y, w, h);
        }
        y += h;
      }
      x += w;
    }
  };

  Sprite_Character.prototype.isOverlaySegment = function(x, y) {
    var tx = Math.floor((this.mx + this.edge[0] + x) / this.tw);
    var ty = Math.floor((this.my + this.edge[1] + y) / this.th);
    return this.overlayTiles.some(function(key) {
      return key[0] === tx && key[1] === ty;
    }.bind(this));
  };

  Sprite_Character.prototype.createUpperSprite = function() {
    if (!this._upperSprite) {
      this._upperSprite = new Sprite()
      this._upperSprite.bitmap = new Bitmap(this.patternWidth(), this.patternHeight());
      this._upperSprite.anchor.x = this.anchor.x;
      this._upperSprite.anchor.y = this.anchor.y;
      this.parent.addChild(this._upperSprite);
    }
  };

  Sprite_Character.prototype.isOnScreenCharacter = function() {
    return this._character.screenZ() <= 5 &&
      this.edge[0] < Graphics._width && this.edge[2] > 0 &&
      this.edge[1] < Graphics._height && this.edge[3] > 0;
  };

  Sprite_Character.prototype.getEdgeRect = function() {
    var x = this.x - Math.round(this.patternWidth() * this.anchor.x);
    var y = this.y - Math.round(this.patternHeight() * this.anchor.y);
    var w = x + this.patternWidth();
    var h = y + this.patternHeight();
    this.edge = [x, y, w, h];
  };

  Sprite_Character.prototype.getEdgeTiles = function() {
    var x = Math.floor((this.mx + this.edge[0]) / this.tw);
    var y = Math.floor((this.my + this.edge[1]) / this.th);
    var w = Math.floor((this.mx + this.edge[2]) / this.tw);
    var h = Math.floor((this.my + this.edge[3]) / this.th);
    this.edgeTiles = [x, y, w, h];
  };

  Sprite_Character.prototype.getMapInfo = function() {
    this.tw = $gameMap.tileWidth();
    this.th = $gameMap.tileHeight();
    this.mx = $gameMap.displayX() * this.tw;
    this.my = $gameMap.displayY() * this.th;
  };
})();