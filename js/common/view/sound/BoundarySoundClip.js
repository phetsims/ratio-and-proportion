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

    this.verticalRange = verticalRange;

    this.lastYPosition = null;
    this.lastXPosition = null;
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
    }
    this.lastYPosition = verticalPosition;

    if ( horizontalPosition ) {

      if ( this.lastXPosition !== horizontalPosition && // don't repeat
           ( horizontalPosition === horizontalRange.min || horizontalPosition === horizontalRange.max ) ) {
        this.play();
      }

      this.lastXPosition = horizontalPosition;
    }
  }

  /**
   * @public
   */
  reset() {
    this.lastYPosition = null;
    this.lastXPosition = null;
  }
}

ratioAndProportion.register( 'BoundarySoundClip', BoundarySoundClip );

export default BoundarySoundClip;