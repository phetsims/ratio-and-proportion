// Copyright 2020, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import ratioAndProportion from '../ratioAndProportion.js';

const RAPConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  RATIO_FITNESS_RANGE: new Range( 0, 1 ),

  // distance (in fitness) from max fitness that still indicates a successful proportion
  IN_PROPORTION_FITNESS_THRESHOLD: 0.025,

  // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
  // same direction. See RAPRatio.movingInDirectionProperty
  MOVING_IN_PROPORTION_FITNESS_THRESHOLD: 0.3,

  // The value to multiple the keyboard step size by to get the shift + keydown step size
  SHIFT_KEY_MULTIPLIER: 1 / 5,

  // The range that the each ratio component (antecedent/consequent) value can be
  TOTAL_RATIO_TERM_VALUE_RANGE: new Range( 0, 1 ),

  // Consistent way to fix numbers. This should only be used in the view for comparison and display, not in the model, see https://github.com/phetsims/ratio-and-proportion/issues/243
  toFixed: x => Utils.toFixedNumber( x, 6 ),

  // The value in which when either the antecedent or consequent is less than this, the ratio cannot be "in proportion".
  // Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
  NO_SUCCESS_VALUE_THRESHOLD: 0.01
};

assert && assert( RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min === 0 && RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE.max === 1,
  'There are assumptions in the model about ratio terms being normalized, see RAPModel.calculateFitness() before changing and proceed with caution' );

ratioAndProportion.register( 'RAPConstants', RAPConstants );
export default RAPConstants;