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
import pizzC3Sound from '../../../../sounds/pizz-C3_mp3.js';
import pizzC4Sound from '../../../../sounds/pizz-C4_mp3.js';
import designingProperties from '../../../common/designingProperties.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

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
    const thirdMarimbaSoundClip = new SoundClip( brightMarimbaSound, {
      initialPlaybackRate: 1 + ( 3 / 12 ) // a third above the tonic
    } );
    tonicMarimbaSoundClip.connect( this.masterGainNode );
    thirdMarimbaSoundClip.connect( this.masterGainNode );

    const tonicPizzC3SoundClip = new SoundClip( pizzC3Sound );
    const thirdPizzC3SoundClip = new SoundClip( pizzC3Sound, {
      initialPlaybackRate: 1 + ( 3 / 12 ) // a third above the tonic
    } );
    tonicPizzC3SoundClip.connect( this.masterGainNode );
    thirdPizzC3SoundClip.connect( this.masterGainNode );

    const tonicPizzC4SoundClip = new SoundClip( pizzC4Sound );
    const thirdPizzC4SoundClip = new SoundClip( pizzC4Sound, {
      initialPlaybackRate: 1 + ( 3 / 12 ) // a third above the tonic
    } );
    tonicPizzC4SoundClip.connect( this.masterGainNode );
    thirdPizzC4SoundClip.connect( this.masterGainNode );

    // @private
    this.tonicSoundClip = tonicMarimbaSoundClip;
    this.thirdSoundClip = thirdMarimbaSoundClip;

    designingProperties.proportionFitnessSoundSelectorProperty.link( selection => {

      if ( selection === 5 ) {
        this.tonicSoundClip = tonicMarimbaSoundClip;
        this.thirdSoundClip = thirdMarimbaSoundClip;
      }
      if ( selection === 6 ) {
        this.tonicSoundClip = tonicPizzC3SoundClip;
        this.thirdSoundClip = thirdPizzC3SoundClip;
      }
      if ( selection === 7 ) {
        this.tonicSoundClip = tonicPizzC4SoundClip;
        this.thirdSoundClip = thirdPizzC4SoundClip;
      }
    } );


    // @private
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;

    // @private
    this.timeLinearFunction = new LinearFunction( fitnessRange.min, fitnessRange.max, 500, 40, true );

    // @private {number} - in ms
    this.timeSinceLastPlay = 0;
    this.playCount = 0; // number of times the staccato tone has played
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
      let soundClip = this.tonicSoundClip;
      if ( 1 - normalizedFitness < .05 && this.playCount % 2 === 0 ) {
        soundClip = this.thirdSoundClip;
      }
      soundClip.play();
      this.timeSinceLastPlay = 0;
      this.playCount++;
    }
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.tonicMarimbaSoundClip.stop();
    this.timeSinceLastPlay = 0;
    this.playCount = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;