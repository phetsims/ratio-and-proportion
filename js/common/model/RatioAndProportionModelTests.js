// Copyright 2020, University of Colorado Boulder

/**
 * RatioAndProportionModel tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RatioAndProportionModel from './RatioAndProportionModel.js';

QUnit.module( 'RatioAndProportionModel' );

QUnit.test( 'Fitness algorithm', assert => {

  const model = new RatioAndProportionModel( Tandem.GENERAL.createTandem( 'model' ) );

  const testFitness = ( fitness, message ) => {
    assert.equal( Utils.toFixedNumber( model.ratioFitnessProperty.value, 6 ), Utils.toFixedNumber( fitness, 6 ), message );
  };
  model.leftValueProperty.value = .3;
  testFitness( .5, 'should be half' );

  model.leftValueProperty.value = .2;
  testFitness( 1, 'should be half' );

  model.leftValueProperty.value = .25;
  testFitness( .75, 'should be half' );

  model.leftValueProperty.value = .4;
  testFitness( 0, 'same value' );

  model.leftValueProperty.value = .5;
  testFitness( 0, 'still no fitness' );

  model.leftValueProperty.value = .3;
  testFitness( .5, 'should be half' );

  model.leftValueProperty.value = .1;
  testFitness( .5, 'swap over the ideal ratio to same fitness' );

  model.leftValueProperty.value = .4;
  testFitness( 0, 'swap over the ideal ratio to no fitness' );

  model.leftValueProperty.value = .15;
  testFitness( .75, 'should be half' );


  model.leftValueProperty.value = .4;
  testFitness( 0, 'reciprocal' );


  model.leftValueProperty.value = 1;
  testFitness( 0, 'zero' );

  model.leftValueProperty.value = .0001;
  testFitness( .0005, 'so much zero' );

  model.leftValueProperty.value = .1;
  testFitness( .5, 'bring it back away from zero' );

  model.rightValueProperty.value = .2;
  testFitness( 1, 'bring it back away from zero' );

  // model.rightValueProperty.value = .3;
  // testFitness( .5, 'bring it back away from zero' );
  //
  // model.rightValueProperty.value = .1;
  // testFitness( .5, 'moving right value now' );

  // TODO: also test left->.1, right->.3, right->.2 Why is fitness getting larger than 1? I don't think it ever should!!!!
} );
