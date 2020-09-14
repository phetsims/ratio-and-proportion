// Copyright 2020, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RAPQueryParameters from './RAPQueryParameters.js';

const RAPConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // distance (in fitness) from max fitness that still indicates a successful proportion
  IN_PROPORTION_FITNESS_THRESHOLD: .025,

  // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
  // same direction. See RAPRatio.movingInDirection()
  MOVING_IN_PROPORTION_FITNESS_THRESHOLD: RAPQueryParameters.movingInProportionThreshold,

  // The value to multiple the keyboard step size by to get the shift + keydown step size
  SHIFT_KEY_MULTIPLIER: 1 / 5,

  // The range that the each ratio component (numerator/denominator) value can be
  TOTAL_RATIO_COMPONENT_VALUE_RANGE: new Range( 0, 1 )
};

ratioAndProportion.register( 'RAPConstants', RAPConstants );
export default RAPConstants;