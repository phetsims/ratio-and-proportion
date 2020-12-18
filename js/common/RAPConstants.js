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

  // distance (in fitness) from max fitness that still indicates a successful proportion
  IN_PROPORTION_FITNESS_THRESHOLD: .025,

  // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
  // same direction. See RAPRatio.movingInDirection()
  MOVING_IN_PROPORTION_FITNESS_THRESHOLD: .3,

  // The value to multiple the keyboard step size by to get the shift + keydown step size
  SHIFT_KEY_MULTIPLIER: 1 / 5,

  // The range that the each ratio component (antecedent/consequent) value can be
  TOTAL_RATIO_TERM_VALUE_RANGE: new Range( 0, 1 ),

  // Consistent way to fix numbers. This should only be used in the view for comparison and display, not in the model, see https://github.com/phetsims/ratio-and-proportion/issues/243
  toFixed: x => Utils.toFixedNumber( x, 6 )
};

ratioAndProportion.register( 'RAPConstants', RAPConstants );
export default RAPConstants;