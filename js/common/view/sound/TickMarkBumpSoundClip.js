// Copyright 2020, University of Colorado Boulder

/**
 * A short sound to indicate when a movable component has crossed over a tick mark.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import tickMarkCrossBump from '../../../../../tambo/sounds/general-soft-click_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

// This value was copied from similar sound work done in Waves Intro
const MIN_INTER_CLICK_TIME = ( 1 / 60 * 1000 ) * 2; // min time between clicks, in milliseconds, empirically determined


class TickMarkBumpSoundClip extends SoundClip {

  /**
   *
   * @param {NumberProperty} tickMarkRangeProperty
   * @param {Range} valueRange
   * @param {Object} [options]
   */
  constructor( tickMarkRangeProperty, valueRange, options ) {
    super( tickMarkCrossBump, options );

    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.valueRange = valueRange;
    this.timeOfLastClick = 0;

    this.lastValue = null;
  }

  /**
   * @public
   * @param currentValue
   */
  onDrag( currentValue ) {

    // handle the sound as desired for mouse/touch style input (for vertical changes)
    for ( let i = 0; i < this.tickMarkRangeProperty.value; i++ ) {
      const tickValue = ( i / this.valueRange.getLength() ) / this.tickMarkRangeProperty.value;

      // Not at max or min, crossed a tick mark value
      if ( currentValue !== this.valueRange.min && currentValue !== this.valueRange.max &&
           this.lastValue < tickValue && currentValue >= tickValue || this.lastValue > tickValue && currentValue <= tickValue ) {

        // if enough time has passed since the last change
        if ( phet.joist.elapsedTime - this.timeOfLastClick >= MIN_INTER_CLICK_TIME ) {
          this.play();
          this.timeOfLastClick = phet.joist.elapsedTime;
        }
        break;
      }
    }

    this.lastValue = currentValue;
  }

  /**
   * @public
   */
  reset() {
    this.timeOfLastClick = 0;
    this.lastValue = null;
  }
}

ratioAndProportion.register( 'TickMarkBumpSoundClip', TickMarkBumpSoundClip );

export default TickMarkBumpSoundClip;