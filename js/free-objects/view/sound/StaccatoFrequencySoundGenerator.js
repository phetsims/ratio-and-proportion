// Copyright 2020, University of Colorado Boulder

/**
 *
 * Marimba bonks that change frequency based on the fitness of the Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import brightMarimbaSound from '../../../../../tambo/sounds/bright-marimba_mp3.js';

class StaccatoFrequencySoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, options ) {
    options = merge( {
      initialOutputLevel: 0.7,
      pitchRangeInSemitones: 36,
      pitchCenterOffset: 2,
      fadeStartDelay: 0.2, // in seconds, time to wait before starting fade
      fadeTime: 0.15, // in seconds, duration of fade out
      delayBeforeStop: 0.1 // in seconds, amount of time from full fade to stop of sound, done to avoid glitches
    }, options );
    super( options );

    const tonicMarimbaSoundClip = new SoundClip( brightMarimbaSound );
    tonicMarimbaSoundClip.connect( this.masterGainNode );

    // @private
    this.tonicMarimbaSoundClip = tonicMarimbaSoundClip;

    // @private
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;

    // @private
    this.timeLinearFunction = new LinearFunction( fitnessRange.min, fitnessRange.max, 500, 40, true );

    // @private {number} - in ms
    this.timeSinceLastPlay = 0;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.timeSinceLastPlay += dt * 1000;

    this.remainingFadeTime = Math.max( this.remainingFadeTime - dt, 0 );

    const normalizedFitness = ( this.fitnessProperty.value - this.fitnessRange.min ) / this.fitnessRange.getLength();

    if ( this.timeSinceLastPlay > this.timeLinearFunction( normalizedFitness ) && normalizedFitness > 0 ) {
      this.tonicMarimbaSoundClip.play();
      this.timeSinceLastPlay = 0;
    }
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.tonicMarimbaSoundClip.stop();
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;