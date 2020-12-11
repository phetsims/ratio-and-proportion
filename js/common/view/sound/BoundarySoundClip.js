// Copyright 2020, University of Colorado Boulder

/**
 * A short sound to indicate when a movable component has reached the boundary of its movable bounds. This sound supports
 * playing a boundary sound based on horizontal motion, as well as vertical motion, but treats each as separate values,
 * and not as a Bounds2. This is to support some interactions (alternative input through keyboard) that only support vertical
 * movement (and thus only vertical boundary sounds)
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

    // @private - keep track of if the sound has been played yet this interaction to see if it should be played at the end of
    // the interaction.
    this.playedThisInteraction = false;
  }

  /**
   * Call this when an interaction occurs that could potentially cause a boundary sound to play. Horizontal parameters
   * are optional to support some vertical-only component interactions.
   * @public
   * @param {number} verticalPosition
   * @param {number} [horizontalPosition]
   * @param {Range} [horizontalRange] - the horizontal range can change based on view scaling
   */
  onInteract( verticalPosition, horizontalPosition, horizontalRange ) {

    if ( this.lastYPosition !== verticalPosition &&
         ( verticalPosition === this.verticalRange.min || verticalPosition === this.verticalRange.max ) ) {
      this.play();
    }
    this.lastYPosition = verticalPosition;

    if ( horizontalPosition ) {

      if ( this.lastXPosition !== horizontalPosition &&
           ( horizontalPosition === horizontalRange.min || horizontalPosition === horizontalRange.max ) ) {
        this.play();
      }

      this.lastXPosition = horizontalPosition;
    }
  }

  /**
   * @public
   */
  onStartInteraction() {
    this.playedThisInteraction = false;
  }

  /**
   * Play a boundary sound on end interaction. This will not play again if the sound already played during this interaction.
   * This case is to support keyboard interaction in which you are at the max, try to increase the value, but don't
   * change the value. This will still result in this sound feedback for the boundary sound.
   * @public
   * @param {number} verticalPosition
   */
  onEndInteraction( verticalPosition ) {
    if ( !this.playedThisInteraction &&
         ( verticalPosition === this.verticalRange.min || verticalPosition === this.verticalRange.max ) ) {
      this.play();
    }
  }

  /**
   * @override
   * @public
   */
  play() {
    this.playedThisInteraction = true;
    super.play();
  }

  /**
   * @public
   */
  reset() {
    this.stop();
    this.playedThisInteraction = false;
    this.lastYPosition = null;
    this.lastXPosition = null;
  }
}

ratioAndProportion.register( 'BoundarySoundClip', BoundarySoundClip );

export default BoundarySoundClip;