// Copyright 2020, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../ratioAndProportion.js';

const RatioAndProportionConstants = {

  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // distance (in fitness) from max fitness that still indicates a successful proportion
  IN_PROPORTION_FITNESS_THRESHOLD: .025,

  // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
  // same direction. See RatioAndProportionModel.movingInDirection()
  MOVING_IN_PROPORTION_FITNESS_THRESHOLD: .01,

  // The value to multiple the keyboard step size by to get the shift + keydown step size
  SHIFT_KEY_MULTIPLIER: 1 / 5
};

ratioAndProportion.register( 'RatioAndProportionConstants', RatioAndProportionConstants );
export default RatioAndProportionConstants;