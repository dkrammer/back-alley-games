//=============================================================================
// EnemyInView.js
//=============================================================================
/*:
 * @plugindesc Contains plugin commands for determining if an enemy is in view.
 *
 * @author Natalie Iwaniuk
 *
 * @help
 *
 * Nope ;)
 */

const checkViews = function(givenEvent) {
	const eventId = givenEvent.eventId()
	const event = $gameMap.event(eventId)
	const player = $gamePlayer
	const distX = player.x - event.x
	const distY = player.y - event.y
	const diffX = Math.abs(distX)
	const diffY = Math.abs(distY)

	let directionNeeded = 0
	if (diffX < 0.35 && diffY < 0.35) {
		// do the mold
		const keyB = [$gameMap.mapId(), eventId, 'B']
		$gameSelfSwitches.setValue(keyB, true)
	} else if (diffX < 2 && diffY < 2) {
		if (diffX >= diffY) {
			if (distX >= 0) {
				// Event is to the left of player.
				directionNeeded = 4
			} else {
				// Event is to the right of player.
				directionNeeded = 6
			}
		} else {
			if (distY >= 0) {
				// Event is above the player
				directionNeeded = 8
			} else {
				// Event is below the player.
				directionNeeded = 2
			}
		}
	}
	
	const keyA = [$gameMap.mapId(), eventId, 'A']
	if (player._direction === directionNeeded) {
		$gameSelfSwitches.setValue(keyA, true)
	}
};

const randShadow = function () {
	const r = Math.floor(Math.random() * 10);
	const se = {pan: 0, pitch: 100, volume: 90}
	switch (r) {
		case 0:
		se.name = 'shadow 0'
		break
		case 1:
		se.name = 'shadow 1'
		break
		case 2:
		se.name = 'shadow 2'
		break
		case 3:
		se.name = 'shadow 3'
		break
		case 4:
		se.name = 'shadow 4'
		break
		case 5:
		se.name = 'shadow 5'
		break
		case 6:
		se.name = 'shadow 6'
		break
		case 7:
		se.name = 'shadow 7'
		break
		case 8:
		se.name = 'shadow 8'
		break
		default:
		se.name = 'shadow 9'
	}
	AudioManager.playSe(se)
};