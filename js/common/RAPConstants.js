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

  // The range that the each ratio component (antecedent/consequent) value can be
  TOTAL_RATIO_COMPONENT_VALUE_RANGE: new Range( 0, 1 ),

  // Consistent way to fix numbers. This should only be used in the view for comparison and display, not in the model, see https://github.com/phetsims/ratio-and-proportion/issues/243
  toFixed: x=> Utils.toFixedNumber( x,6),

  /**
   * Handle keyboard input in a consistent way across all usages of keyboard input to the ratio. This function is
   * responsible for making sure that keyboard input snaps to
   *
   * @public
   * @param {function():number} getIdealValue - get the ideal target value
   * @param {number} keyboardStep
   * @param {number} shiftKeyboardStep
   * @returns {function(newValue: number, oldValue:number, isBeingInteractedWithProperty:boolean):number} - returns a function that returns the snap/conserved value
   */
  mapPostProcessKeyboardInput: ( getIdealValue, keyboardStep, shiftKeyboardStep ) => {

    // keep track of the remainder for next input post-process
    let remainder = 0;

    const snappingFunction = ( newValue, oldValue, useShiftKeyStep ) => {
      // Don't conserve the snap for page up/down or home/end keys, just basic movement changes.
      const applyConservationSnap = RAPConstants.toFixed( Math.abs( newValue - oldValue ), 6 ) <= shiftKeyboardStep;

      if ( remainder === 0 ) {
        const snapToKeyboardStep = useShiftKeyStep ? shiftKeyboardStep : keyboardStep;
        newValue = RAPConstants.toFixed(
          Utils.roundSymmetric( newValue / snapToKeyboardStep ) * snapToKeyboardStep,
          Utils.numberOfDecimalPlaces( snapToKeyboardStep ) );
      }

      if ( applyConservationSnap ) {

        let returnValue = newValue;
        const target = RAPConstants.toFixed( getIdealValue(), 6 );
        if ( newValue > target !== oldValue > target && oldValue !== target ) {
          remainder = RAPConstants.toFixed( newValue - target, 6 );
          returnValue = target;
        }

        else if ( remainder !== 0 ) {
          newValue = newValue + remainder;
          remainder = 0;
          returnValue = newValue;
        }

        returnValue = RAPConstants.toFixed( returnValue, 6 );
        assert && assert( !isNaN( returnValue ) );

        return returnValue;
      }
      return newValue;
    };

    // @public
    snappingFunction.reset = () => { remainder = 0; };

    return snappingFunction;
  }
};

ratioAndProportion.register( 'RAPConstants', RAPConstants );
export default RAPConstants;