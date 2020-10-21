// Copyright 2020, University of Colorado Boulder

/**
 * A short sound to indicate when a movable component has reached the boundary of its movable bounds.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import boundarySound from '../../../../../tambo/sounds/general-boundary-boop_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

class BoundarySoundClip extends SoundClip {

  /**
   *
   * @param {Range} verticalRange
   * @param {Object} [options]
   */
  constructor( verticalRange, options ) {
    super( boundarySound, options );

    // @private
    this.verticalRange = verticalRange;
    this.lastYPosition = null;
    this.lastXPosition = null;

    // @private - keep track of if the sound has been played yet this drag to see if it should be played at the end of
    // the drag.
    this.playedThisDrag = false;
  }

  /**
   * Horizontal parameters are optional to support some vertical-only component interactions.
   * @public
   * @param {number} verticalPosition
   * @param {number} [horizontalPosition]
   * @param {Range} [horizontalRange] - the horizontal range can change based on view scaling
   */
  onDrag( verticalPosition, horizontalPosition, horizontalRange ) {

    if ( this.lastYPosition !== verticalPosition && ( verticalPosition === this.verticalRange.min || verticalPosition === this.verticalRange.max ) ) {
      this.play();
      this.playedThisDrag = true;
    }
    this.lastYPosition = verticalPosition;

    if ( horizontalPosition ) {

      if ( this.lastXPosition !== horizontalPosition && // don't repeat
           ( horizontalPosition === horizontalRange.min || horizontalPosition === horizontalRange.max ) ) {
        this.play();
        this.playedThisDrag = true;
      }

      this.lastXPosition = horizontalPosition;
    }
  }

  /**
   * Play a boundary sound on end drag. This will not play again if the sound already played during this drag. This case
   * is to support keyboard interaction in which you are at the max, try to increase the value, but don't change the value.
   * This will still result in this sound feedback for the boundary sound.
   * @public
   * @param verticalPosition
   */
  onEndDrag( verticalPosition ) {

    if ( !this.playedThisDrag && ( verticalPosition === this.verticalRange.min || verticalPosition === this.verticalRange.max ) ) {
      this.play();
    }

    // For next time
    this.playedThisDrag = false;
  }

  /**
   * @public
   */
  reset() {
    this.playedThisDrag = false;
    this.lastYPosition = null;
    this.lastXPosition = null;
  }
}

ratioAndProportion.register( 'BoundarySoundClip', BoundarySoundClip );

export default BoundarySoundClip;