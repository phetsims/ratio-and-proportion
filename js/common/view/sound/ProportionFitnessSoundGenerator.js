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
import Range from '../../../../../dot/js/Range.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import choirAhhSound from '../../../../sounds/choir-ahhh-loop_wav.js';
import stringsSound from '../../../../sounds/strings-loop-c5_wav.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import CMajorSineSoundGenerator from './CMajorSineSoundGenerator.js';
import SineWaveGenerator from './SineWaveGenerator.js';
import StaccatoFrequencySoundGenerator from './StaccatoFrequencySoundGenerator.js';

// constants
// For vibrato
const VIBRATO_PITCH = 220;

// To play velocity success sound. . .
const VELOCITY_THRESHOLD = .01; // both velocities have to be larger than this
const FITNESS_THRESHOLD = .5; // fitness has to be larger than this


class ProportionFitnessSoundGenerator extends SoundGenerator {

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
      initialOutputLevel: 0.7
    }, options );

    super( options );

    // @private
    this.proportionFitnessProperty = proportionFitnessProperty;

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
      new DerivedProperty( [ designingProperties.proportionFitnessSoundSelectorProperty ], value => value === 0 )
    ];

    const sineWaveGenerator1 = new SineWaveGenerator( frequency1Property, {
      enableControlProperties: enableControlProperties
    } );
    const sineWaveGenerator2 = new SineWaveGenerator( frequency2Property, {
      enableControlProperties: enableControlProperties
    } );
    sineWaveGenerator1.connect( this.masterGainNode );
    sineWaveGenerator2.connect( this.masterGainNode );

    Property.multilink( [ proportionFitnessProperty ],
      fitness => {
        frequency1Property.value = sineWaveGenerator1.fullyEnabled ?
                                   VIBRATO_PITCH + ( ( 1 - fitness ) * frequency1Range.getLength() + frequency1Range.min ) :
                                   VIBRATO_PITCH; // set back to default if not enabled, for next time.
      } );

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
    // Velocity success sound

    const stringsSoundClip = new SoundClip( stringsSound, {
      loop: true,
      initialOutputLevel: .7
    } );

    stringsSoundClip.connect( this.masterGainNode );

    const choirAhhSoundClip = new SoundClip( choirAhhSound, {
      loop: true,
      initialOutputLevel: .7
    } );
    choirAhhSoundClip.connect( this.masterGainNode );

    let velocitySoundClip = stringsSoundClip;
    designingProperties.velocitySoundSelectorProperty.link( selection => {
      if ( selection === 0 ) {
        velocitySoundClip = stringsSoundClip;
      }
      else if ( selection === 1 ) {
        velocitySoundClip = choirAhhSoundClip;
      }
      else {
        velocitySoundClip = null;
      }
    } );

    Property.multilink( [ isBeingInteractedWithProperty, leftVelocityProperty, rightVelocityProperty, proportionFitnessProperty ],
      ( isBeingInteractedWith, leftVelocity, rightVelocity, fitness ) => {
        if ( velocitySoundClip ) {
          if ( Math.abs( leftVelocity ) > VELOCITY_THRESHOLD && Math.abs( rightVelocity ) > VELOCITY_THRESHOLD && // both past threshold
               isBeingInteractedWith && // must be being interacted with (no sound on reset etc)
               fitness > FITNESS_THRESHOLD && // must be fit enough to play
               ( leftVelocity > 0 === rightVelocity > 0 ) ) { // both hands should be moving in the same direction
            velocitySoundClip.setOutputLevel( .7, .1 );
            !velocitySoundClip.isPlaying && velocitySoundClip.play();
          }
          else {
            velocitySoundClip.setOutputLevel( 0, .2 );
          }
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
  }

  /**
   * Step this sound generator.
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'ProportionFitnessSoundGenerator', ProportionFitnessSoundGenerator );

export default ProportionFitnessSoundGenerator;