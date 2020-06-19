// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import SineWaveGenerator from './SineWaveGenerator.js';

// constants
const C_FREQUENCY = 130.8128;
const E_FREQUENCY = 164.8138;
const G_FREQUENCY = 195.9977;

const SUCCESS_C_VOLUME = .3;
const OUTPUT_LEVEL = .5;

class CMajorSineSoundGenerator extends SineWaveGenerator {

  /**
   * @param {Property.<number>} fitnessProperty - see ProportionModel
   * @param {Range} fitnessRange
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, options ) {
    super( new Property( C_FREQUENCY ), options );

    const eGenerator = new SineWaveGenerator( new Property( E_FREQUENCY ), { initialOutputLevel: OUTPUT_LEVEL } );
    const gGenerator = new SineWaveGenerator( new Property( G_FREQUENCY ), { initialOutputLevel: OUTPUT_LEVEL } );
    const topCGenerator = new SineWaveGenerator( new Property( C_FREQUENCY * 2 ), { initialOutputLevel: OUTPUT_LEVEL } ); // only plays when proportion perfect

    eGenerator.connect( this.soundSourceDestination );
    gGenerator.connect( this.soundSourceDestination );
    topCGenerator.connect( this.soundSourceDestination );

    Property.multilink( [ this.fullyEnabledProperty, fitnessProperty ],
      ( enabled, fitness ) => {
        const newVolume = enabled ? OUTPUT_LEVEL : 0;
        eGenerator.setOutputLevel( fitness > ( fitnessRange.getLength() / 3 ) ? newVolume : 0 );
        gGenerator.setOutputLevel( fitness > ( 2 * fitnessRange.getLength() / 3 ) ? newVolume : 0 );

        topCGenerator.setOutputLevel( fitness > .96 ? SUCCESS_C_VOLUME : 0 );
      }
    );
  }
}

ratioAndProportion.register( 'CMajorSineSoundGenerator', CMajorSineSoundGenerator );

export default CMajorSineSoundGenerator;