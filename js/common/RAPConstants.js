// Copyright 2020, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
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
  TOTAL_RATIO_COMPONENT_VALUE_RANGE: new Range( 0, 1 ),

  /**
   * Given a value, snap it to the nearest shift keyboard step.
   * @public
   * @param {number} value
   * @param {number} keyboardStep
   * @returns {number}
   */
  SNAP_TO_KEYBOARD_STEP: ( value, keyboardStep ) => {
    return Utils.toFixedNumber(
      Utils.roundSymmetric( value / keyboardStep ) * keyboardStep,
      Utils.numberOfDecimalPlaces( keyboardStep ) );
  },

  /**
   * @public
   * @param {function():number} getIdealValue - get the ideal target value
   * @param keyboardStep TODO
   * @param shiftKeyboardStep
   * @returns {function(newValue: number, oldValue:number):number} - returns a function that returns the snap/conserved value
   */
  getHandleInProportionConserveSnapFunction: ( getIdealValue, keyboardStep, shiftKeyboardStep ) => {


    const remainderObject = { remainder: 0 };
    return ( newValue, oldValue, useShiftKeyStep ) => {

      // // TODO: just for debugging
      // const startingVars = {
      //   newValue,
      //   oldValue,
      //   remainder: remainderObject.remainder
      // };

      // Don't conserve the snap for page up/down or home/end keys, just basic movement changes. TODO: what about number keys in both hands? is that too small sometimes?
      const applyConservationSnap = Utils.toFixedNumber( Math.abs( newValue - oldValue ), 6 ) <= keyboardStep;

      // TODO: what if there is a remainder and then you use mouse input?!?! https://github.com/phetsims/ratio-and-proportion/issues/175
      if ( remainderObject.remainder === 0 ) {
        newValue = RAPConstants.SNAP_TO_KEYBOARD_STEP( newValue, useShiftKeyStep ? shiftKeyboardStep : keyboardStep );
      }

      // TODO: care about if we can't make proportion right now (below .5)
      if ( applyConservationSnap ) {

        let returnValue = newValue;
        const target = getIdealValue();
        if ( newValue > target !== oldValue > target && oldValue !== target ) {
          remainderObject.remainder = Utils.toFixedNumber( newValue - target, 6 );
          returnValue = target;
        }

        else if ( remainderObject.remainder !== 0 ) {
          newValue = newValue + remainderObject.remainder;
          remainderObject.remainder = 0;
          returnValue = newValue;
        }

        returnValue = Utils.toFixedNumber( returnValue, 6 );
        assert && assert( !isNaN( returnValue ) );

        return returnValue;
      }
      return newValue;
    };
  }
};

ratioAndProportion.register( 'RAPConstants', RAPConstants );
export default RAPConstants;