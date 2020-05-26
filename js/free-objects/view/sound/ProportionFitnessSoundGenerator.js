// Copyright 2020, University of Colorado Boulder

/**
 * Sound generator that plays a sound based on the fitness of the ratioAndProportion.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import Range from '../../../../../dot/js/Range.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import saturatedSinWave from '../../../../../tambo/sounds/220hz-saturated-sine-loop_mp3.js';
import choirAhhSound from '../../../../sounds/choir-ahhh-loop_wav.js';
import stringsSound from '../../../../sounds/strings-loop-c5_wav.js';
import designingProperties from '../../../common/designingProperties.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import CMajorSineSoundGenerator from './CMajorSineSoundGenerator.js';
import SineWaveGenerator from './SineWaveGenerator.js';
import StaccatoFrequencySoundGenerator from './StaccatoFrequencySoundGenerator.js';

// constants
const VIBRATO_PITCH = 220;

// For Proportion_Strings/Velocity
const fitnessToPlaybackOutput = new LinearFunction( 0, 1, 0, .7, true );
const VELOCITY_THRESHOLD = .01;


class ProportionFitnessSoundGenerator extends SoundClip {

  /**
   * @param {Property.<number>} proportionFitnessProperty
   * @param {Range} fitnessRange
   * @param {Property.<boolean>} isBeingInteractedWithProperty - if there is any interaction occurring to either left/right object
   * @param {Property.<number>} leftVelocityProperty
   * @param {Property.<number>} rightVelocityProperty
   * @param {Object} [options]
   */
  constructor( proportionFitnessProperty,
               fitnessRange,
               isBeingInteractedWithProperty,
               leftVelocityProperty, rightVelocityProperty,
               options ) {

    options = merge( {
      initialOutputLevel: 0.7,
      loop: true,
      pitchRangeInSemitones: 36,
      pitchCenterOffset: 2,
      fadeStartDelay: 0.2, // in seconds, time to wait before starting fade
      fadeTime: 0.15, // in seconds, duration of fade out
      delayBeforeStop: 0.1, // in seconds, amount of time from full fade to stop of sound, done to avoid glitches

      // {number} - number of octaves that the playback rate will span, larger numbers increase pitch range
      playbackRateSpanOctaves: 2,

      // {number} - Center offset of playback rate, positive numbers move the pitch range up, negative numbers move it
      // down, and a value of zero indicates no offset, so the pitch range will center around the inherent pitch of
      // the source loop.  This offset is added to the calculated playback rate, so a value of 1 would move the range
      // up an octave, -1 would move it down an octave, 0.5 would move it up a perfect fifth, etc.
      // TODO: decide if we need this
      playbackRateCenterOffset: 0
    }, options );

    super( saturatedSinWave, options );

    // @private
    this.proportionFitnessProperty = proportionFitnessProperty;

    // @private {number} - see docs at options declaration
    this.fadeTime = options.fadeTime;

    // @private {number} - see docs at options declaration
    this.delayBeforeStop = options.delayBeforeStop;

    // @private {number} - the output level before fade out starts
    this.nonFadedOutputLevel = options.initialOutputLevel;

    // @private {number} - countdown time used for fade out
    this.remainingFadeTime = 0;

    // @private
    this.fadeTime = options.fadeTime;
    this.fadeStartDelay = options.fadeStartDelay;

    // start with the output level at zero so that the initial sound generation has a bit of fade in
    this.setOutputLevel( 0, 0 );

    const fitnessNotMinProperty = new DerivedProperty( [ proportionFitnessProperty ], fitness => fitness !== fitnessRange.min );

    //////////////////////////////////////////////////////////////////////////////
    // VIBRATO
    const frequency1Range = new Range( 0, 10 );
    const frequency1Property = new NumberProperty( VIBRATO_PITCH );
    const frequency2Property = new NumberProperty( VIBRATO_PITCH );

    const enableControlProperties = [
      isBeingInteractedWithProperty,
      fitnessNotMinProperty,

      // TODO: maybe separate out "strings" into its own vibrato code
      new DerivedProperty( [ designingProperties.proportionFitnessSoundSelectorProperty ], value => value === 0 || value === 3 )
    ];

    const sineWaveGenerator1 = new SineWaveGenerator( frequency1Property, {
      enableControlProperties: enableControlProperties
    } );
    const sineWaveGenerator2 = new SineWaveGenerator( frequency2Property, {
      enableControlProperties: enableControlProperties
    } );
    sineWaveGenerator1.connect( this.masterGainNode );
    sineWaveGenerator2.connect( this.masterGainNode );

    const supportVibration = value => {
      frequency1Property.value = sineWaveGenerator1.fullyEnabled ?
                                 VIBRATO_PITCH + ( ( 1 - value ) * frequency1Range.getLength() + frequency1Range.min ) :
                                 VIBRATO_PITCH; // set back to default if not enabled, for next time.
    };

    //////////////////////////////////////////////////////////////////
    // C MAJOR FUN!

    const cMajorSineSoundGenerator = new CMajorSineSoundGenerator( proportionFitnessProperty, {
      enableControlProperties: [
        isBeingInteractedWithProperty,
        fitnessNotMinProperty,
        new DerivedProperty( [ designingProperties.proportionFitnessSoundSelectorProperty ], value => value === 2 )
      ]
    } );
    cMajorSineSoundGenerator.connect( this.masterGainNode );

    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    // Proportion_strings!

    const stringsSoundClip = new SoundClip( stringsSound, {
      loop: true,
      initialOutputLevel: 0
    } );

    stringsSoundClip.connect( this.masterGainNode );

    const choirAhhSoundClip = new SoundClip( choirAhhSound, {
      loop: true,
      initialOutputLevel: 0
    } );
    choirAhhSoundClip.connect( this.masterGainNode );

    let velocitySound = stringsSoundClip;
    designingProperties.velocitySoundSelectorProperty.link( selection => {
      if ( selection === 0 ) {
        velocitySound = stringsSoundClip;
      }
      else if ( selection === 1 ) {
        velocitySound = choirAhhSoundClip;
      }
    } );

    proportionFitnessProperty.link( fitness => {
      velocitySound.setOutputLevel( fitnessToPlaybackOutput( fitness ) );
    } );

    Property.multilink( [ isBeingInteractedWithProperty, leftVelocityProperty, rightVelocityProperty ],
      ( isBeingInteractedWith, leftVelocity, rightVelocity ) => {
        if ( Math.abs( leftVelocity ) > VELOCITY_THRESHOLD && Math.abs( rightVelocity ) > VELOCITY_THRESHOLD && // both past threshold
             isBeingInteractedWith && // must be being interacted with (no sound on reset etc)
             ( leftVelocity > 0 === rightVelocity > 0 ) ) { // both pointers should move in the same direction
          velocitySound.play();
        }
        else {
          velocitySound.stop();
        }
      } );

    //////////////////////////////////////////////////////////////////
    // staccato

    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( proportionFitnessProperty, fitnessRange, {
      enableControlProperties: [
        isBeingInteractedWithProperty,
        fitnessNotMinProperty,
        new DerivedProperty( [ designingProperties.proportionFitnessSoundSelectorProperty ],
          value => value === 5 || value === 6 || value === 7 )
      ]
    } );
    this.staccatoFrequencySoundGenerator.connect( this.masterGainNode );

    //////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////

    Property.multilink( [
      isBeingInteractedWithProperty,
      proportionFitnessProperty,
      designingProperties.proportionFitnessSoundSelectorProperty
    ], ( interactedWith, fitness, selector ) => {

      // vibration wiring
      ( selector === 0 || selector === 3 ) && supportVibration( fitness );

      if ( !interactedWith ) {
        this.reset();
      }
      if ( selector === 4 && interactedWith ) {
        this.supportPitchChange( fitness );
      }
    } );
  }

  /**
   * @public
   */
  dispose() {
    super.dispose();
  }

  /**
   * Step this sound generator.
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {
    this.staccatoFrequencySoundGenerator.step( dt );
  }

  /**
   * Change the pitch for the valueProperty
   * @param currentValue
   * @private
   */
  supportPitchChange( currentValue ) {

    const playbackRate = currentValue;
    assert && assert( !isNaN( playbackRate ), 'playback rate should be a number' );

    this.setPlaybackRate( playbackRate );
    this.setOutputLevel( this.nonFadedOutputLevel );
    if ( !this.playing ) {
      this.play();
    }

    // reset the fade countdown
    this.remainingFadeTime = this.fadeStartDelay + this.fadeTime + this.delayBeforeStop;
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.stop( 0 );
    this.remainingFadeTime = 0;
  }
}

ratioAndProportion.register( 'ProportionFitnessSoundGenerator', ProportionFitnessSoundGenerator );

export default ProportionFitnessSoundGenerator;