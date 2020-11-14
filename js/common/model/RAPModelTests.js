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

QUnit.test( 'keyboard always can get in proportion: moving down', assert => {

  const model = new RAPModel( Tandem.OPT_OUT );
  const ratioTupleProperty = model.ratio.ratioTupleProperty;

  const getIdealValue = () => model.getIdealValueForComponent( RatioComponent.NUMERATOR );
  const remainderObject = { remainder: 0 };
  model.targetRatioProperty.value = 2 / 7;
  ratioTupleProperty.value = new RAPRatioTuple( .14, .4 );

  let newValue = null;

  newValue = RAPConstants.handleInProportionConserveSnap( .13, ratioTupleProperty.value.numerator, getIdealValue, remainderObject );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .13, 'one step down' );

  newValue = RAPConstants.handleInProportionConserveSnap( .12, ratioTupleProperty.value.numerator, getIdealValue, remainderObject );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .12, 'another step down' );

  newValue = RAPConstants.handleInProportionConserveSnap( .11, ratioTupleProperty.value.numerator, getIdealValue, remainderObject );
  ratioTupleProperty.value.numerator = newValue;
  const idealRatio = Utils.toFixedNumber( model.targetRatioProperty.value * ratioTupleProperty.value.denominator, 6 ); // to prevent rounding errors
  assert.ok( ratioTupleProperty.value.numerator === idealRatio, 'another step down should snap to in proportion' );
  assert.ok( remainderObject.remainder === .11 - idealRatio, 'remainder successfully set' );

  newValue = RAPConstants.handleInProportionConserveSnap( ratioTupleProperty.value.numerator - .01, ratioTupleProperty.value.numerator, getIdealValue, remainderObject );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .10, 'another step down should snap to in proportion' );

  newValue = RAPConstants.handleInProportionConserveSnap( .09, ratioTupleProperty.value.numerator, getIdealValue, remainderObject );
  ratioTupleProperty.value.numerator = newValue;
  assert.ok( ratioTupleProperty.value.numerator === .09, 'another step down should snap to in proportion' );
} );
