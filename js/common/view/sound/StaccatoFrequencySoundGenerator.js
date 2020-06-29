// Copyright 2020, University of Colorado Boulder

/**
 * TODO: isInteractingProperty should reset this.playedSuccessYet = false;??? https://github.com/phetsims/ratio-and-proportion/issues/63
 * Marimba bonks that change frequency based on the fitness of the Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import MultiClip from '../../../../../tambo/js/sound-generators/MultiClip.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import brightMarimbaSound from '../../../../../tambo/sounds/bright-marimba_mp3.js';
import dingRingOutSound from '../../../../sounds/c4-ding-ring-out_mp3.js';
import glockMarimbaCMaj7ArpeggioSound from '../../../../sounds/glock-marimba-c-maj-7-arp_mp3.js';
import marimbaVariation0Sound from '../../../../sounds/marimba-variations-000_mp3.js';
import marimbaVariation2Sound from '../../../../sounds/marimba-variations-002_mp3.js';
import marimbaVariation3Sound from '../../../../sounds/marimba-variations-003_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

const SUCCESS_OUTPUT_LEVEL = .8;
const INITIAL_PLAYBACK_RATE = 1;

// Playback rate will be between 1 and a major third above
const getPlaybackRate = fitness => fitness * ( Math.pow( 2, 7 / 12 ) - INITIAL_PLAYBACK_RATE ) + INITIAL_PLAYBACK_RATE;

const BRIGHT_MARIMBA_VALUE = 0;

// to support multiple sound options, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/9
// IMPORTANT: don't change the order here without looking at this.getStaccatoSoundValueToPlay()
const staccatoSoundMap = new Map();
staccatoSoundMap.set( BRIGHT_MARIMBA_VALUE, brightMarimbaSound );
staccatoSoundMap.set( 1, marimbaVariation0Sound );
staccatoSoundMap.set( 2, marimbaVariation2Sound );
staccatoSoundMap.set( 3, marimbaVariation3Sound );

class StaccatoFrequencySoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, options ) {
    options = merge( {
      initialOutputLevel: 0.4
    }, options );
    super( options );

    const singleSuccessSoundClip = new SoundClip( dingRingOutSound );
    const singleArpeggiatedChord = new SoundClip( glockMarimbaCMaj7ArpeggioSound );
    singleSuccessSoundClip.connect( this.soundSourceDestination );
    singleArpeggiatedChord.connect( this.soundSourceDestination );

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

    this.staccatoSoundClip = new MultiClip( staccatoSoundMap, {
      initialPlaybackRate: INITIAL_PLAYBACK_RATE
    } );
    this.staccatoSoundClip.connect( this.soundSourceDestination );

    // @private
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;
    this.timeLinearFunction = new LinearFunction( fitnessRange.min, fitnessRange.max, 500,
      RatioAndProportionQueryParameters.staccatoMinRepeatTime, true );
    this.timeSinceLastPlay = 0;
    this.oldFitness = this.fitnessProperty.value;

    // @private {number} - keep track of the last value to prevent the same sound from being played twice in a row.
    this.lastStaccatoSoundValue = -1;

    // @private - keep track of if the success sound has already played. This will be set back to false when the fitness
    // goes back out of range for the success sound.
    this.playedSuccessYet = false;

    // @private
    this.fitnessChanged = true;
    let previousFitness = fitnessProperty.value;
    fitnessProperty.lazyLink( ( newValue, oldValue ) => {

      // make sure that a sound plays right when fitness first changes from 0
      if ( oldValue === fitnessRange.min ) {
        this.fitnessChanged = true;
        this.timeSinceLastPlay = 100000;
      }

      if ( Math.abs( previousFitness - newValue ) > RatioAndProportionQueryParameters.fitnessChangeThreshold ) {
        this.fitnessChanged = true;
        previousFitness = newValue;
      }
    } );
  }

  /**
   * JUust needed to support time-related options in this sound generator, either increase frequency as fitness increases,
   * or keep it constant, respecting a minimum time between sounds.
   * @param {number} fitness
   * @private
   */
  getTimeConstraintForFitness( fitness ) {
    if ( designingProperties.staccatoChangesFrequencyProperty.value ) {
      return this.timeLinearFunction( fitness );
    }
    return RatioAndProportionQueryParameters.staccatoMinRepeatTime;
  }

  /**
   * @param {number} fitness
   * @returns {number}
   * @private
   */
  getNormalizedFitness( fitness ) {
    return ( fitness - this.fitnessRange.min ) / this.fitnessRange.getLength();
  }

  /**
   * Is the ratio currently considered a success as it pertains to this sound generator
   * @param {number} fitness
   * @returns {boolean}
   * @private
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
    const newFitness = this.fitnessProperty.value;

    // don't play staccato sounds when fitness is 0
    if ( newFitness === this.fitnessRange.min ) {
      return;
    }

    // Only increment when within some amount of fitness. This helps prevent sporadic notes from playing when you move
    // the ratio hands quickly and drastically.
    this.timeSinceLastPlay = newFitness > 0 ? this.timeSinceLastPlay + dt * 1000 : 0;

    const isInRatio = this.isInSuccessfulRatio( newFitness );
    if ( isInRatio && !this.playedSuccessYet ) {

      // TODO: is it possible that this will just bring a previous playing's reverb back to life and the play another instance on top of it? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL );
      this.successSoundClip.play();
      this.playedSuccessYet = true;
    }
    else if ( this.timeSinceLastPlay > this.getTimeConstraintForFitness( newFitness ) && !isInRatio ) {

      // Don't modulate pitch for marimba sound
      if ( designingProperties.staccatoSoundSelectorProperty.value !== BRIGHT_MARIMBA_VALUE ) {
        this.staccatoSoundClip.setPlaybackRate( getPlaybackRate( newFitness ) );
      }
      else if ( this.staccatoSoundClip.playbackRate !== 1 ) {
        // set things back to 1 if we just changed staccato sound
        // TODO: this can likely get removed once a single sound design is solidified
        this.staccatoSoundClip.setPlaybackRate( 1 );
      }

      // if changing frequency, then always play this sound, otherwise, wait until fitness has changed above the threshold
      if ( designingProperties.staccatoChangesFrequencyProperty.value ||
           ( !designingProperties.staccatoChangesFrequencyProperty.value && this.fitnessChanged ) ) {
        this.staccatoSoundClip.playAssociatedSound( this.getStaccatoSoundValueToPlay() );
        this.fitnessChanged = false;
      }
      this.timeSinceLastPlay = 0;
    }

    // if we were in ratio, but now we are not, then fade out the successSoundClip
    if ( this.isInSuccessfulRatio( this.oldFitness ) && !isInRatio ) {

      // TODO: is there a way to get a notification when this is done ramping down? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( 0, .1 );
      this.playedSuccessYet = false;
    }

    this.oldFitness = newFitness;
  }

  /**
   * Get the value of the MultiClip map for the staccato sound to play, see "staccatoSoundMap"
   * @returns {number}
   * @private
   */
  getStaccatoSoundValueToPlay() {
    if ( designingProperties.staccatoSoundSelectorProperty.value === 0 ) {
      return BRIGHT_MARIMBA_VALUE;
    }
    else {
      assert && assert( designingProperties.staccatoSoundSelectorProperty.value === 1 );

      let soundValue = this.lastStaccatoSoundValue;
      while ( soundValue === this.lastStaccatoSoundValue ) {

        // "3 + 1" is a hard coded number based on staccatoSoundMap
        soundValue = Math.floor( phet.joist.random.nextDouble() * 3 + 1 );
      }

      this.lastStaccatoSoundValue = soundValue;
      return soundValue;
    }
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.staccatoSoundClip.stop( 0 );
    this.successSoundClip.stop( 0 );
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;