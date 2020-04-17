// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import merge from '../../../../phet-core/js/merge.js';
import proportion from '../../proportion.js';
import SineWaveGenerator from './SineWaveGenerator.js';

// constants
const C_FREQUENCY = 130.8128;
const E_FREQUENCY = 164.8138;
const G_FREQUENCY = 195.9977;

const INITIAL_VOLUME = .2;
const SUPPLEMENTAL_VOLUME = INITIAL_VOLUME * 3;
const SUCCESS_C_VOLUME = .3;

const volumeLinearFunction = new LinearFunction( 0, 1, 0, SUPPLEMENTAL_VOLUME, true );

class CMajorSineSoundGenerator extends SineWaveGenerator {

  /**
   * @param {Property.<number>} fitnessProperty - see ProportionModel
   * @param {Object} [options]
   */
  constructor( fitnessProperty, options ) {
    options = merge( {
      initialOutputLevel: INITIAL_VOLUME
    }, options );
    super( new Property( C_FREQUENCY ), options );

    const eGenerator = new SineWaveGenerator( new Property( E_FREQUENCY ), { initialOutputLevel: 0 } );
    const gGenerator = new SineWaveGenerator( new Property( G_FREQUENCY ), { initialOutputLevel: 0 } );
    const topCGenerator = new SineWaveGenerator( new Property( C_FREQUENCY * 2 ), { initialOutputLevel: 0 } ); // only plays when proportion perfect

    eGenerator.connect( this.masterGainNode );
    gGenerator.connect( this.masterGainNode );
    topCGenerator.connect( this.masterGainNode );

    Property.multilink( [ this.fullyEnabledProperty, fitnessProperty ],
      ( enabled, fitness ) => {
        const newVolume = enabled ? volumeLinearFunction( fitness ) : 0;
        eGenerator.setOutputLevel( newVolume );
        gGenerator.setOutputLevel( newVolume );

        topCGenerator.setOutputLevel( fitness === 1 ? SUCCESS_C_VOLUME : 0 );
      }
    );
  }
}

proportion.register( 'CMajorSineSoundGenerator', CMajorSineSoundGenerator );

export default CMajorSineSoundGenerator;