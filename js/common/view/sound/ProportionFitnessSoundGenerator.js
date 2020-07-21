// Copyright 2020, University of Colorado Boulder

/**
 * Sound generator that plays a sound based on the fitness of the ratioAndProportion.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import InProportionSoundGenerator from './InProportionSoundGenerator.js';
import MovingInProportionSoundGenerator from './MovingInProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './StaccatoFrequencySoundGenerator.js';

// constants


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

    super( options );

    // @private
    this.ratioFitnessProperty = ratioFitnessProperty;

    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( ratioFitnessProperty, fitnessRange, model, {
      enableControlProperties: [ isBeingInteractedWithProperty ]
    } );
    this.staccatoFrequencySoundGenerator.connect( this.soundSourceDestination );

    this.inProportionSoundGenerator = new InProportionSoundGenerator( ratioFitnessProperty, fitnessRange, model, {
      enableControlProperties: [ isBeingInteractedWithProperty ]
    } );
    this.inProportionSoundGenerator.connect( this.soundSourceDestination );

    this.movingInProportionSoundGenerator = new MovingInProportionSoundGenerator( ratioFitnessProperty, model, {
      enableControlProperties: [ isBeingInteractedWithProperty ]
    } );
    this.movingInProportionSoundGenerator.connect( this.soundSourceDestination );
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

  /**
   * @public
   */
  reset() {
    this.staccatoFrequencySoundGenerator.reset();
    this.inProportionSoundGenerator.reset();
    this.movingInProportionSoundGenerator.reset();
  }
}

ratioAndProportion.register( 'ProportionFitnessSoundGenerator', ProportionFitnessSoundGenerator );

export default ProportionFitnessSoundGenerator;