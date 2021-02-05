/*:
==============================================================================
@author Chaucer

@plugindesc | Animated Overlay Addon : Version - 1.0.4 | This plugin adds to the OrangeOverlay plugin, and allows you to animate parallaxes.

@help
==============================================================================
  PLUGIN INFO
==============================================================================

* ()()
* (^.^)
*c(")(")

* Author : Chaucer
* Plugin : Animated Overlay Addon
* Version : 1.0.4 | Date : 08/07/2017

==============================================================================
  CONTACT :
==============================================================================

* Email : chaucer91( at )gmail( dot )com
* Skype ID : chaucer1991
* RpgMakerWeb Forum ID : Chaucer

==============================================================================
  REQUIREMENTS :
==============================================================================

* Scripts :
  OrangeOverlay.js : this script is meant to add onto OrangeOverlay, and is
  useless without it.


==============================================================================
  DESCRIPTION :
==============================================================================

* This plugin adds to the OrangeOverlay plugin, and allows you to animate
  overlay images.

==============================================================================
  INSTRUCTIONS :
==============================================================================

  Naming Images :
  --------------------------------------------------------------------------
    When naming the animated images, please include _ followed by the index
    of the image, please take note that the index will always start on 0 and
    NOT 1, so please name images accordingly( example : example_0, example_1,
    example_2, etc.. ).


  Changing animated layers :
  --------------------------------------------------------------------------
    When changing a layer that is animated via plugin command( example :
    Overlay ground ground1-v1 ), do NOT include _0, as this plugin will
    do so on it's own.


  Map Note Tags :
  --------------------------------------------------------------------------
    keys :
      f = the amount of frames( or images ), that will be used.
      s = the amount of frames that must pass before changing frames.

    notes :
    <animate_parallax: f, s > : parallax layer will animate  upon map entry.
    <animate_shadow: f, s > : shadow layer will animate  upon map entry.
    <animate_ground: f, s > : ground layer will animate upon map entry.
    <animate_light: f, s > : light layer will animate  upon map entry.


  Plugin Commands :
  --------------------------------------------------------------------------

    command : animate_layer l f s
    -----------------------------
    description : tell a layer to start animating.

    command : change_layer_speed l s
    --------------------------------
    description : change the speed of a given layers animation.

    command : stop_layer_animation l
    --------------------------------
    description : tell a layer to stop animating.

    keys :
    ------
    f = the amount of images used in the animation.
    l = the name of the layer( ground, parallax, shadow, light ).
    s = the amount of frames that must pass before changing frames.

==============================================================================
  CHANGE LOG
==============================================================================

* ● Version : 1.0.0
* ● Date : 05/07/2017
*   ★ Release.

* ● Version : 1.0.1
* ● Date : 05/07/2017
*   ☆ Removed an unnecessary console statement.

* ● Version : 1.0.2
* ● Date : 08/07/2017
*   ☆ Animation will no longer play until each frame has been loaded.
*   ☆ Added hide layers by switch to this script, rather than OrangeOverlay.

* ● Version : 1.0.3
* ● Date : 08/07/2017
*   ☆ Animated layers will no longer require the base image to animate.

* ● Version : 1.0.4
* ● Date : 08/07/2017
*   ☆ Light Layer no longer crashes when trying to animate.
*   ☆ Reworded some segments of help file.

==============================================================================
  TERMS OF USE.
==============================================================================

==============================================================================
  END OF HELP.
==============================================================================

*/

//============================================================================
var Imported = Imported || new Object();
Imported["Chaucer_AnimatedOverlays"] = true;
//============================================================================
var Chaucer = Chaucer || Object();
Chaucer.animatedOverlays = new Object();
//============================================================================

//============================================================================
( function ( $ ) { //IIFE
//============================================================================
  'use strict';
  let regexp, alias, desc, name, version, params, z;
//Create plugin information.
//============================================================================
  for ( let i = 0; i < $plugins.length; i++ ) {
    regexp = /Animated Overlay Addon : Version - \d+\.\d+\.\d+/;
    desc = $plugins[i].description.match( regexp );
    if ( !desc ) continue;
    desc = desc[0];
    alias = new Object();
    name = desc.split(":")[0].trim();
    version = desc.split("-")[1].trim();
    params = $plugins[i].parameters;
    break;
  };
  z = OrangeOverlay;
  $.name = name;
  $.version = version;
  $.params = params;
  $.alias = alias;
//============================================================================

  // throw error if OrangeOverlay not installed.
//============================================================================
  var error = $.name + " : " + $.version;
  error = error + " requires OrangeOverlay - version 1.1 or higher";
  error =  error + ", please make sure the script is installed."
  if ( Imported.OrangeOverlay < 1.1 ) console.warn( error );
//============================================================================

// add extra featurs to OrangeOverlay.
//============================================================================

  // animate params for each layer.
  z.animateParallax = false;
  z.animateGround = false;
  z.animateShadow = false;
  z.animateLight = false;
  z.animateFog = false;

  // set the base speed for each animated layer.
  z.parallaxAnimeSpeed = 15;
  z.groundAnimeSpeed = 15;
  z.shadowAnimeSpeed = 15;
  z.lightAnimeSpeed = 15;
  z.fogAnimeSpeed = 15;

  // set the base speed for each animated layer.
  z.parallaxAnimeCount = 0;
  z.groundAnimeCount = 0;
  z.shadowAnimeCount = 0;
  z.lightAnimeCount = 0;
  z.fogAnimeCount = 0;

  // set the base frame count for each later.
  z.parallaxFrames = 1;
  z.groundFrames = 1;
  z.shadowFrames = 1;
  z.lightFrames = 1;
  z.fogFrames = 1;

  // set the base frame count for each later.
  z.parallaxFrame = 0;
  z.groundFrame = 0;
  z.shadowFrame = 0;
  z.lightFrame = 0;
  z.fogFrame = 0;
//============================================================================

//============================================================================
// Game_Map : contains aliased methods for the game map class.
//============================================================================

//Alias of Game_Map.prototype.setup.
//--------------------------------------------------------------------------
alias.GM_p_setup = Game_Map.prototype.setup;
//--------------------------------------------------------------------------
Game_Map.prototype.setup = function ( mapId ) {
//--------------------------------------------------------------------------
  alias.GM_p_setup.call( this, mapId ); // call the original method.
  z.animateGround = !!$dataMap.meta.animate_ground;
  z.animateParallax = !!$dataMap.meta.animate_parallax;
  z.animateShadow = !!$dataMap.meta.animate_shadow;
  z.animateLight = !!$dataMap.meta.animate_light;

  // start animation for ground layer.
  if ( z.animateGround ) {
    var data = $dataMap.meta.animate_ground.split(",").map( Number );
    z.groundFrames = data[0];
    z.groundAnimeSpeed = data[1];
  }

  // start animation for parallax layer.
  if ( z.animateParallax ) {
      var data = $dataMap.meta.animate_parallax.split(",").map( Number );
      z.parallaxFrames = data[0];
      z.parallaxAnimeSpeed = data[1];
  };

  // start animation for shadow layer.
  if ( z.animateShadow ) {
      var data = $dataMap.meta.animate_shadow.split(",").map( Number );
      z.shadowFrames = data[0];
      z.shadowAnimeSpeed = data[1];
  };

  // start animation for light layer.
  if ( z.animateLight ) {
      var data = $dataMap.meta.animate_light.split(",").map( Number );
      z.lightFrames = data[0];
      z.lightAnimeSpeed = data[1];
  };

//--------------------------------------------------------------------------
};//End of alias.
//--------------------------------------------------------------------------

//============================================================================
// Game_Interpreter : Contains aliased methods for Game interpreter class.
//============================================================================

  //Alias of Game_Interpreter.prototype.pluginCommand.
  //--------------------------------------------------------------------------
  alias.GI_p_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  //--------------------------------------------------------------------------
  Game_Interpreter.prototype.pluginCommand = function ( command, args ) {
  //--------------------------------------------------------------------------
    alias.GI_p_pluginCommand.call( this, command, args ); // call the original method.
    var layers, layer, speed, frames, letter, name;
    command = command.toLowerCase();

    // when a layer is changed and it's an animated layer.
    layers = ["ground", "par", "light", "shadow"];
    if ( command === "overlay" && layers.indexOf( args[0] ) >= 0 ) {
      if ( args[0] === "par" ) args[0] = "parallax";
      letter = args[0].charAt( 0 ).toUpperCase();
      name = letter + args[0].split( args[0].charAt( 0 ) ).pop();
      // ensure that animated frames are loaded all at once.
      if ( OrangeOverlay["animate" + name] ) {
        $.loadFrames( args[0], z[args[0] + "Frames"] )
      }
    };

    // get the layer, letter, and name.
    layer = args[0].trim().toLowerCase();
    letter = layer.charAt( 0 ).toUpperCase();
    name = letter + layer.split( layer.charAt( 0 ) ).pop();

    // begin layer animations.
    if ( command === "animate_layer" ) {
      frames = Number( args[1] );
      speed = Number( args[2] );
      OrangeOverlay["animate" + name] = true;
      OrangeOverlay[layer + "Frames"] = frames;
      OrangeOverlay[layer + "AnimeSpeed"] = speed;
      $.loadFrames( layer, frames );
    }

    // stop an animation and clear it's values.
    if ( command === "stop_layer_animation" ) {
      OrangeOverlay["animate" + name] = false;
      OrangeOverlay[layer + "AnimeSpeed"] = 1;
      OrangeOverlay[layer + "Frames"] = 1;
    };
    // change the animation speed.
    if ( command === "change_layer_speed" ) {
      var layer, speed;
      // set the layer and the speed.
      layer = args[0].trim().toLowerCase();
      speed = Number( args[1] );
      OrangeOverlay[layer + "AnimeSpeed"] = speed;
    };
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------

//============================================================================
// Spriteset_Map : contains aliased methods for spritest map class.
//============================================================================

  //Alias of Spriteset_Map.prototype.createGroundLayer.
  //--------------------------------------------------------------------------
  alias.SM_p_createGroundLayer = Spriteset_Map.prototype.createGroundLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.createGroundLayer = function () {
  //--------------------------------------------------------------------------
    if ( z.animateGround ) {
      var name = z.groundName || z.Param.groundLayerFileName;
      if ( !z.groundName ) name = name + $gameMap._mapId;
      name = name + "_" + z.groundFrame;
      this._groundLayer = this.createLayer('grounds', name, 'ground', 1, 0);
    } else {
      alias.SM_p_createGroundLayer.call( this ); // call the original method.
    }
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------

  //Alias of Spriteset_Map.prototype.createParallaxLayer.
  //--------------------------------------------------------------------------
  alias.SM_p_createParLayer = Spriteset_Map.prototype.createParallaxLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.createParallaxLayer = function () {
  //--------------------------------------------------------------------------
    if ( z.animateParallax ) {
      var name = z.parallaxName || z.Param.parallaxLayerFileName;
      if ( !z.parallaxName ) name = name + $gameMap._mapId;
      name = name + "_" + z.parallaxFrame;
      this._parallaxLayer = this.createLayer( 'pars', name, 'par', 20, z.Param.parallaxSwitchId );
    } else {
      alias.SM_p_createParLayer.call( this ); // call the original method.
    }
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------

  //Alias of Spriteset_Map.prototype.createShadowLayer.
  //--------------------------------------------------------------------------
  alias.SM_p_createShadowLayer = Spriteset_Map.prototype.createShadowLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.createShadowLayer = function () {
  //--------------------------------------------------------------------------
    if ( z.animateShadow ) {
      var name = z.shadowName || z.Param.shadowLayerFileName;
      if ( !z.shadowName ) name = name + $gameMap._mapId;
      name = name + "_" + z.shadowFrame;
      this._shadowLayer = this.createLayer('shadows', name, 'shadow', 21, z.Param.shadowSwitchId);
    } else {
      alias.SM_p_createShadowLayer.call( this ); // call the original method.
    }
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------

//Alias of Spriteset_Map.prototype.createLightLayer.
//--------------------------------------------------------------------------
alias.SM_p_createLightLayer = Spriteset_Map.prototype.createLightLayer;
//--------------------------------------------------------------------------
Spriteset_Map.prototype.createLightLayer  = function () {
//--------------------------------------------------------------------------
  if ( z.animateLight ) {
    var name = z.lightName || z.Param.lightLayerFileName;
    if ( !z.lightName ) name = name + $gameMap._mapId;
    name = name + "_" + z.lightFrame;
    this._lightLayer = this.createLayer('lights', name, 'light', 23, z.Param.lightSwitchId, z.Param.lightOpacity);
  } else {
    alias.SM_p_createLightLayer.call( this ); // call the original method.
  }
//--------------------------------------------------------------------------
};//End of alias.
//--------------------------------------------------------------------------

  //Alias of Spriteset_Map.prototype.updateGroundLayer.
  //--------------------------------------------------------------------------
  alias.SM_p_updateGroundLayer = Spriteset_Map.prototype.updateGroundLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.updateGroundLayer = function () {
  //--------------------------------------------------------------------------
    if ( z.animateGround ) {
      var layer, update, name;

      // update anime count && anime frame.
      z.groundAnimeCount = ( 1 + z.groundAnimeCount ) % z.groundAnimeSpeed;
      if ( z.groundAnimeCount === 0 ) {
        z.groundFrame = ( z.groundFrame + 1 ) % z.groundFrames;
      };
      // set parameters needed for layer update.
      layer = "_groundLayer";
      update = z.groundAnimeCount === 0;
      name = z.groundName || z.Param.groundLayerFileName;
      if ( !z.groundName ) name = name + $gameMap._mapId;
      name = name + "_" + z.groundFrame;
      // update the layer, depending on whether the bitmap is loaded or not.
      var bitmap = this.loadBitmap( 'img/grounds/', name );
      if ( bitmap._loadingState === "requesting" )
        this.updateLayer( layer, false, "grounds", name, "ground", 1, 0 );
      else
        this.updateLayer( layer, update, "grounds", name, "ground", 1, 0 );

    } else {
      alias.SM_p_updateGroundLayer.call( this ); // call the original method.
    }
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------

  //Alias of Spriteset_Map.prototype.updateParallaxLayer.
  //--------------------------------------------------------------------------
  alias.SM_p_updateParallaxLayer = Spriteset_Map.prototype.updateParallaxLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.updateParallaxLayer = function () {
  //--------------------------------------------------------------------------


//============================================================================
// Chaucer : update the parallax layer visiibility from switch.
//============================================================================
    if ( $gameSwitches.value(OrangeOverlay.Param.parallaxSwitchId) && this._parallaxLayer !== null) {
      if ( !this._parallaxLayer.visible )this._parallaxLayer.visible = true;
    } else {
      if ( this._parallaxLayer !== null && this._parallaxLayer.visible ) this._parallaxLayer.visible = false;
      return;
    }
//============================================================================

    if ( z.animateParallax ) {
      var layer, update, name, swId;

      // update the anime count & current frame.
      z.parallaxAnimeCount = (1 + z.parallaxAnimeCount) % z.parallaxAnimeSpeed;
      if ( z.parallaxAnimeCount === 0 )
        z.parallaxFrame = ( 1 + z.parallaxFrame ) % z.parallaxFrames;

      // set the parameters needed for layer update.
      layer = "_parallaxLayer";
      update = z.parallaxAnimeCount === 0;
      name = z.parallaxName || z.Param.parallaxLayerFileName;
      if ( !z.parallaxName ) name = name + $gameMap._mapId;
      name = name + "_" + z.parallaxFrame;
      swId = z.Param.parallaxSwitchId

      // update the layer, depending on whether the bitmap is loaded or not.
      var bitmap = this.loadBitmap( 'img/pars/', name );
      if ( bitmap._loadingState === "requesting" )
        this.updateLayer( layer, false, "pars", name, "par", 20, swId );
      else
        this.updateLayer( layer, update, "pars", name, "par", 20, swId );

    } else {
      alias.SM_p_updateParallaxLayer.call( this ); // call the original method.
    }
  //--------------------------------------------------------------------------
  };//End of alias.
  //--------------------------------------------------------------------------


//Alias of Spriteset_Map.prototype.updateShadowLayer.
//--------------------------------------------------------------------------
  alias.SM_p_updateShadowLayer = Spriteset_Map.prototype.updateShadowLayer;
  //--------------------------------------------------------------------------
  Spriteset_Map.prototype.updateShadowLayer = function () {
  //--------------------------------------------------------------------------
  // Chaucer : update the light layer visiibility from switch.
  //============================================================================
  if ( $gameSwitches.value( OrangeOverlay.Param.shadowSwitchId ) && this._shadowLayer !== null) {
    if ( !this._shadowLayer.visible )this._shadowLayer.visible = true;
  } else {
    if (this._shadowLayer !== null && this._shadowLayer.visible ) this._shadowLayer.visible = false;
    return;
  }
  //============================================================================


    if ( z.animateShadow ) {
      var layer, update, name, swId;

      // update the anime count & current frame.
      z.shadowAnimeCount = (1 + z.shadowAnimeCount) % z.shadowAnimeSpeed;
      if ( z.shadowAnimeCount === 0 )
        z.shadowFrame = ( 1 + z.shadowFrame ) % z.shadowFrames;

        // set the parameters needed for layer update.
        layer = "_shadowLayer";
        update = z.shadowAnimeCount === 0;
        name = z.shadowName || z.Param.shadowLayerFileName;
        if ( !z.shadowName ) name = name + $gameMap._mapId;
        name = name + "_" + z.shadowFrame;
        swId = z.Param.shadowSwitchId

        // update the layer.
        // update the layer, depending on whether the bitmap is loaded or not.
        var bitmap = this.loadBitmap( 'img/shadows/', name );
        if ( bitmap._loadingState === "requesting" )
          this.updateLayer( layer, false, "shadows", name, "shadow", 21, swId );
        else
          this.updateLayer( layer, update, "shadows", name, "shadow", 21, swId );

    } else {
      alias.SM_p_updateShadowLayer.call( this ); // call the original method.
  }

//--------------------------------------------------------------------------
};//End of alias.
//--------------------------------------------------------------------------


//Alias of Spriteset_Map.prototype.updateLightLayer.
//--------------------------------------------------------------------------
alias.SM_p_updateLightLayer = Spriteset_Map.prototype.updateLightLayer;
//--------------------------------------------------------------------------
Spriteset_Map.prototype.updateLightLayer = function () {
//--------------------------------------------------------------------------
//============================================================================
// Chaucer : update the light layer visiibility from switch.
//============================================================================
if ( $gameSwitches.value( OrangeOverlay.Param.lightSwitchId ) && this._lightLayer !== null ) {
  if ( !this._lightLayer.visible )this._lightLayer.visible = true;
} else {
  if ( this._lightLayer !== null && this._lightLayer.visible ) this._lightLayer.visible = false;
  return;
}
//============================================================================

  if ( z.animateLight ) {
    var layer, update, name, swId, op, w1, w2;

    // update the anime count & current frame.
    z.lightAnimeCount = (1 + z.lightAnimeCount) % z.lightAnimeSpeed;
    if ( z.lightAnimeCount === 0 )
      z.lightFrame = ( 1 + z.lightFrame ) % z.lightFrames;

      // set the parameters needed for layer update.
      layer = "_lightLayer";
      update = z.lightAnimeCount === 0;
      name = z.lightName || z.Param.lightLayerFileName;
      if ( !z.lightName ) name = name + $gameMap._mapId;
      name = name + "_" + z.lightFrame;
      swId = z.Param.lightSwitchId
      w1 = "lights";
      w2 = "light";
      op = z.Param.lightOpacity;
      // update the layer.
      var bitmap = this.loadBitmap( 'img/lights/', name );
      if ( bitmap._loadingState === "requesting" )
        this.updateLayer( layer, false, w1, name, w2, 23, swId, op, 1 );
      else
        this.updateLayer( layer, update, w1, name, w2, 23, swId, op, 1 );

  } else {
    alias.SM_p_updateLightLayer.call( this ); // call the original method.
  }
//--------------------------------------------------------------------------
};//End of alias.
//--------------------------------------------------------------------------


//============================================================================
// Custom : below is a list of functions unique to this script.
//============================================================================


//loadFrames : Load all images that should be played for a layer.
//----------------------------------------------------------------------------
$.loadFrames = function ( layer, frames ) {
//----------------------------------------------------------------------------
  var folder, name;
  if ( layer === "ground" ) folder = "grounds";
  if ( layer === "parallax" ) folder = "pars";
  if ( layer === "shadow" ) folder = "shadows";
  if ( layer === "light" ) folder = "lights";
  name = z[layer + "Name"] || z.Param[layer + "LayerFileName"];
  if ( !z[layer + "Name"] ) name = name + $gameMap._mapId;
  for ( var i  = 0; i < frames; i++ ) {
    ImageManager.loadBitmap('img/parallaxes32x32/' + '/', name + "_" + i);
  };
//----------------------------------------------------------------------------
}; // End of loadFrames
//----------------------------------------------------------------------------
//============================================================================
} )( Chaucer.animatedOverlays ); //END OF IIFE
//============================================================================
