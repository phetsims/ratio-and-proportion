// Copyright 2020, University of Colorado Boulder

/**
 * Sound generator that plays a sound based on the fitness of the ratioAndProportion.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import choirAhhSound from '../../../../sounds/choir-ahhh-loop_wav.js';
import stringsSound from '../../../../sounds/strings-loop-c5_wav.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';
import InProportionSoundGenerator from './InProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './StaccatoFrequencySoundGenerator.js';

// constants
const FITNESS_THRESHOLD = RatioAndProportionQueryParameters.movingInProportionThreshold;


class ProportionFitnessSoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Range} fitnessRange
   * @param {Property.<boolean>} isBeingInteractedWithProperty - if there is any interaction occurring to either left/right object
   * @param {RatioAndProportionModel} model - TODO: pass all of model in here? At least factor out fitness stuff above
   * @param {Object} [options]
   */
  constructor( ratioFitnessProperty,
               fitnessRange,
               isBeingInteractedWithProperty,
               model,
               options ) {

    options = merge( {
      initialOutputLevel: 0.7
    }, options );

    super( options );

    // @private
    this.ratioFitnessProperty = ratioFitnessProperty;


    //////////////////////////////////////////////////////////////////
    // "Moving in Proportion" sound

    const stringsSoundClip = new SoundClip( stringsSound, {
      loop: true,
      initialOutputLevel: .7
    } );

    stringsSoundClip.connect( this.soundSourceDestination );

    const choirAhhSoundClip = new SoundClip( choirAhhSound, {
      loop: true,
      initialOutputLevel: .7
    } );
    choirAhhSoundClip.connect( this.soundSourceDestination );

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

    Property.multilink( [ isBeingInteractedWithProperty, model.leftVelocityProperty, model.rightVelocityProperty, ratioFitnessProperty ],
      ( isBeingInteractedWith, leftVelocity, rightVelocity, fitness ) => {
        if ( velocitySoundClip ) {
          if ( model.movingInDirection() &&
               fitness > FITNESS_THRESHOLD && // must be fit enough to play this special bimodal sound
               isBeingInteractedWith ) {
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

    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( ratioFitnessProperty, fitnessRange, model, {
      enableControlProperties: [ isBeingInteractedWithProperty ]
    } );
    this.staccatoFrequencySoundGenerator.connect( this.soundSourceDestination );

    //////////////////////////////////////////////////////////////////   //////////////////////////////////////////////////////////////////
    // in proportion

    this.inProportionSoundGenerator = new InProportionSoundGenerator( ratioFitnessProperty, fitnessRange, model, {
      enableControlProperties: [ isBeingInteractedWithProperty ]
    } );
    this.inProportionSoundGenerator.connect( this.soundSourceDestination );

    //////////////////////////////////////////////////////////////////
  }

  /**
   * Step this sound generator.
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {
    this.inProportionSoundGenerator.step( dt );
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'ProportionFitnessSoundGenerator', ProportionFitnessSoundGenerator );

export default ProportionFitnessSoundGenerator;