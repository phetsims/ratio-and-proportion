// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for RAPModel
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RAPConstants from '../RAPConstants.js';
import RAPModel from './RAPModel.js';
import RAPRatioTuple from './RAPRatioTuple.js';
import RatioComponent from './RatioComponent.js';

QUnit.module( 'RAPModel' );

// Copied from keyboard step calculation in RAPScreenView.js
const keyboardStep = 1 / 2 / 10;

QUnit.test( 'keyboard always can get in proportion: 2/7 moving down', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.ratioTupleProperty;

  const getIdealValue = () => model.getIdealValueForComponent( RatioComponent.NUMERATOR );
  const snapConserveFunction = RAPConstants.getHandleInProportionConserveSnapFunction( getIdealValue, keyboardStep, keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( .14, .4 );

  let newValue = null;

  newValue = snapConserveFunction( .13, ratioTupleProperty.value.numerator, true );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .13, 'one step down' );

  newValue = snapConserveFunction( .12, ratioTupleProperty.value.numerator, true );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .12, 'another step down' );

  newValue = snapConserveFunction( .11, ratioTupleProperty.value.numerator, true );
  ratioTupleProperty.value.numerator = newValue;
  const idealRatio = Utils.toFixedNumber( model.targetRatioProperty.value * ratioTupleProperty.value.denominator, 6 ); // to prevent rounding errors
  assert.ok( ratioTupleProperty.value.numerator === idealRatio, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( ratioTupleProperty.value.numerator - .01, ratioTupleProperty.value.numerator, true );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .10, 'another step down should snap to in proportion' );

  newValue = snapConserveFunction( .09, ratioTupleProperty.value.numerator, true );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .09, 'another step down should snap to in proportion' );
} );

QUnit.test( 'keyboard always can get in proportion: 2/7 moving up', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.ratioTupleProperty;

  const getIdealValue = () => model.getIdealValueForComponent( RatioComponent.NUMERATOR );
  const snapConserveFunction = RAPConstants.getHandleInProportionConserveSnapFunction( getIdealValue, keyboardStep, keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER );
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( .05, .4 );

  let newValue = null;

  newValue = snapConserveFunction( .1, ratioTupleProperty.value.numerator, false );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .1, 'step up' );

  newValue = snapConserveFunction( .15, ratioTupleProperty.value.numerator, false );
  ratioTupleProperty.value.numerator = newValue;
  const idealNumerator = Utils.toFixedNumber( model.targetRatioProperty.value * ratioTupleProperty.value.denominator, 6 ); // to prevent rounding errors
  assert.ok( ratioTupleProperty.value.numerator === idealNumerator, 'step up through ideal' );

  newValue = snapConserveFunction( ratioTupleProperty.value.numerator + .05, ratioTupleProperty.value.numerator, false );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .2, 'step up through ideal' );
} );
