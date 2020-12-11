// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for RAPModel
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import RAPConstants from '../RAPConstants.js';
import RAPModel from './RAPModel.js';
import RAPRatioTuple from './RAPRatioTuple.js';
import RatioTerm from './RatioTerm.js';

QUnit.module( 'RAPModel' );

// Copied from keyboard step calculation in RAPScreenView.js
const keyboardStep = 1 / 2 / 10;

QUnit.test( 'keyboard always can get in proportion: 2/7 moving down', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;

  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = RAPConstants.mapPostProcessKeyboardInput( getIdealValue, keyboardStep, keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( .14, .4 );

  let newValue = null;

  newValue = snapConserveFunction( .13, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .13, 'one step down' );

  newValue = snapConserveFunction( .12, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .12, 'another step down' );

  newValue = snapConserveFunction( .11, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  const idealRatio = RAPConstants.toFixed( model.targetRatioProperty.value * ratioTupleProperty.value.consequent, 6 ); // to prevent rounding errors
  assert.ok( ratioTupleProperty.value.antecedent === idealRatio, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent - .01, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .10, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( .09, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .09, 'another step down should snap to in proportion' );
} );

QUnit.test( 'keyboard always can get in proportion: 2/7 moving up', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.tupleProperty;

  const getIdealValue = () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT );
  const snapConserveFunction = RAPConstants.mapPostProcessKeyboardInput( getIdealValue, keyboardStep, keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( .09, .4 );

  let newValue = null;

  newValue = snapConserveFunction( .1, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .1, 'step up' );

  newValue = snapConserveFunction( .11, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .11, 'step up' );

  newValue = snapConserveFunction( .12, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  const idealAntecedent = RAPConstants.toFixed( model.targetRatioProperty.value * ratioTupleProperty.value.consequent, 6 ); // to prevent rounding errors
  assert.ok( ratioTupleProperty.value.antecedent === idealAntecedent, 'step up through ideal' );

  newValue = snapConserveFunction( ratioTupleProperty.value.antecedent + .01, ratioTupleProperty.value.antecedent, true );
  ratioTupleProperty.value.antecedent = newValue;
  assert.ok( ratioTupleProperty.value.antecedent === .13, 'step up' );
} );
