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
import brightMarimbaSound from '../../../../../tambo/sounds/bright-marimba_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';
import SoundClipChord from './SoundClipChord.js';

class StaccatoFrequencySoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, options ) {
    options = merge( {
      initialOutputLevel: 0.7
    }, options );
    super( options );

    // TODO: wire these up with better sounds
    this.singleSuccessSoundClip = new SoundClip( brightMarimbaSound, {
      initialPlaybackRate: 2
    } );
    this.singleArpeggiatedChord = new SoundClipChord( brightMarimbaSound, {
      chordPlaybackRates: [ 1, Math.pow( 2, 4 / 12 ), Math.pow( 2, 7 / 12 ), Math.pow( 2, 11 / 12 ) ],
      arpeggiate: true
    } );
    this.singleSuccessSoundClip.connect( this.masterGainNode );
    this.singleArpeggiatedChord.connect( this.masterGainNode );


    this.tonicSoundClip = new SoundClip( brightMarimbaSound );
    this.tonicSoundClip.connect( this.masterGainNode );

    // @private
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;
    this.timeLinearFunction = new LinearFunction( fitnessRange.min, fitnessRange.max, 500,
      RatioAndProportionQueryParameters.staccatoMinRepeatTime, true );
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

    if ( this.timeSinceLastPlay > this.timeLinearFunction( normalizedFitness ) ) {

      // success condition
      if ( 1 - normalizedFitness < .05 ) {

        if ( !this.ratioSuccess ) {
          if ( designingProperties.staccatoSuccessSoundSelectorProperty.value === 0 ) {
            // TODO: make ding sound
            this.singleSuccessSoundClip.play();
          }
          else if ( designingProperties.staccatoSuccessSoundSelectorProperty.value === 1 ) {

            // TODO: make the better argeppi chord sound clip
            this.singleArpeggiatedChord.play();
          }
          this.ratioSuccess = true;
        }
      }
      else {
        this.ratioSuccess = false;
        this.tonicSoundClip.play();
        this.timeSinceLastPlay = 0;
      }
    }
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.tonicSoundClip.stop( 0 );
    this.thirdSoundClip.stop( 0 );
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;