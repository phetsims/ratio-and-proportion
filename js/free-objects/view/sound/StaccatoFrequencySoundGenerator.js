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
import soundManager from '../../../../../tambo/js/soundManager.js';
import brightMarimbaSound from '../../../../../tambo/sounds/bright-marimba_mp3.js';
import pizzC3Sound from '../../../../sounds/pizz-C3_mp3.js';
import pizzC4Sound from '../../../../sounds/pizz-C4_mp3.js';
import designingProperties from '../../../common/designingProperties.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

// constants
const majorThirdPlaybackSpeed = Math.pow( 2, 4 / 12 );
const SOUND_CHOICES = [ null, null, null, null, null, brightMarimbaSound, pizzC3Sound, pizzC4Sound ];

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

    // @private
    this.tonicSoundClip = null;
    this.thirdSoundClip = null;
    this.singleSuccessSoundClip = null;

    // @private - possibly temporary, for making single success note sound more airy
    this.defaultReverb = soundManager.reverbLevel;

    // this is to handle the case where proportionFitnessSoundSelectorProperty isn't a staccato sound on startup
    this.wireUpSoundClips( brightMarimbaSound );

    designingProperties.proportionFitnessSoundSelectorProperty.link( selection => {

      const sound = SOUND_CHOICES[ selection ];

      if ( sound ) {
        this.wireUpSoundClips( sound );
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
   * TODO: this is just to support multiple sound options, and won't need to be this complicated once things settle, see https://github.com/phetsims/ratio-and-proportion/issues/9
   * @private
   * @param {WrappedAudioBuffer} sound
   */
  wireUpSoundClips( sound ) {

    // dispose previous ones
    if ( this.tonicSoundClip ) {

      // TODO: is this necessary?
      this.tonicSoundClip.stop();
      this.thirdSoundClip.stop();
      this.singleSuccessSoundClip.stop();

      this.tonicSoundClip.dispose();
      this.thirdSoundClip.dispose();
      this.singleSuccessSoundClip.dispose();
    }

    this.tonicSoundClip = new SoundClip( sound );
    this.thirdSoundClip = new SoundClip( sound, {
      initialPlaybackRate: majorThirdPlaybackSpeed
    } );
    this.singleSuccessSoundClip = new SoundClip( sound, {
      initialPlaybackRate: 2
    } );

    this.tonicSoundClip.connect( this.masterGainNode );
    this.thirdSoundClip.connect( this.masterGainNode );
    this.singleSuccessSoundClip.connect( this.masterGainNode );
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
        if ( designingProperties.staccatoSuccessSoundSelectorProperty.value === 0 ) {
          let soundClip = this.tonicSoundClip;
          if ( this.playCount % 2 === 0 ) {
            soundClip = this.thirdSoundClip;
          }
          soundClip.play();
          this.timeSinceLastPlay = 0;
          this.playCount++;
        }
        else if ( designingProperties.staccatoSuccessSoundSelectorProperty.value === 1 && !this.ratioSuccess ) {
          soundManager.reverbLevel = .8;
          this.singleSuccessSoundClip.play();
        }

        this.ratioSuccess = true;
      }
      else {
        if ( this.ratioSuccess ) {
          soundManager.reverbLevel = this.defaultReverb;
        }
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
    this.playCount = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;