// Copyright 2020, University of Colorado Boulder

/**
 * TODO: isInteractingProperty should reset this.playedSuccessYet = false;???
 * Marimba bonks that change frequency based on the fitness of the Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import brightMarimbaSound from '../../../../../tambo/sounds/bright-marimba_mp3.js';
import dingRingOutSound from '../../../../sounds/c4-ding-ring-out_mp3.js';
import glockMarimbaCMaj7ArpeggioSound from '../../../../sounds/glock-marimba-c-maj-7-arp_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

const SUCCESS_OUTPUT_LEVEL = 1;

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

    const singleSuccessSoundClip = new SoundClip( dingRingOutSound );
    const singleArpeggiatedChord = new SoundClip( glockMarimbaCMaj7ArpeggioSound );
    singleSuccessSoundClip.connect( this.masterGainNode );
    singleArpeggiatedChord.connect( this.masterGainNode );

    // @private
    this.successSoundClip = null;
    designingProperties.staccatoSuccessSoundSelectorProperty.link( selector => {
      if ( selector === 0 ) {
        this.successSoundClip = singleSuccessSoundClip;
      }
      else if ( selector === 1 ) {
        this.successSoundClip = singleArpeggiatedChord;
      }
      else {
        assert && assert( false, 'unexpected staccato success sound selected' );
      }
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL );
    } );

    this.tonicSoundClip = new SoundClip( brightMarimbaSound );
    this.tonicSoundClip.connect( this.masterGainNode );

    // @private
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;
    this.timeLinearFunction = new LinearFunction( fitnessRange.min, fitnessRange.max, 500,
      RatioAndProportionQueryParameters.staccatoMinRepeatTime, true );
    this.timeSinceLastPlay = 0;
    this.oldFitness = this.fitnessProperty.value;
  }

  /**
   * @param {number} fitness
   * @returns {number}
   */
  getNormalizedFitness( fitness ) {
    return ( fitness - this.fitnessRange.min ) / this.fitnessRange.getLength();
  }

  /**
   * Is the ratio currently considered a success as it pertains to this sound generator
   * @param {number} fitness
   * @returns {boolean}
   */
  isInSuccessfulRatio( fitness ) {
    return 1 - this.getNormalizedFitness( fitness ) < .1;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.timeSinceLastPlay += dt * 1000;

    this.remainingFadeTime = Math.max( this.remainingFadeTime - dt, 0 );

    const newFitness = this.fitnessProperty.value;
    const normalizedFitness = this.getNormalizedFitness( newFitness );
    const isInRatio = this.isInSuccessfulRatio( newFitness );
    if ( isInRatio && !this.playedSuccessYet ) {

      // TODO: is it possible that this will just bring a previous playing's reverb back to life and the play another instance on top of it?
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL );
      this.successSoundClip.play();
      this.playedSuccessYet = true;
    }
    else if ( this.timeSinceLastPlay > this.timeLinearFunction( normalizedFitness ) && !isInRatio ) {
      this.tonicSoundClip.play();
      this.timeSinceLastPlay = 0;
    }

    // if we were in ratio, but now we are not, then fade out the successSoundClip
    if ( this.isInSuccessfulRatio( this.oldFitness ) && !isInRatio ) {
      this.successSoundClip.setOutputLevel( 0, .1 );
      this.playedSuccessYet = false;
    }

    this.oldFitness = newFitness;
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.tonicSoundClip.stop( 0 );
    this.successSoundClip.stop( 0 );
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;