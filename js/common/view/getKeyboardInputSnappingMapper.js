// Copyright 2020, University of Colorado Boulder

/**
 * Handle keyboard input in a consistent way across all usages of keyboard input to the ratio. This function creates and returns a
 * function that is responsible for making sure that keyboard input snaps to the in-proportion value if it would pass over it.
 * In some cases of targetProperty, the default keyboard steps are not granular enough to acheive the in-proportion state with keyboard
 * input. This function will map those keyboard steps to exact, in-proportion values while conserving the same number keypresses to get
 * in between tick marks for consistent UX.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';

/**
 * @param {function():number} getIdealValue - get the ideal target value
 * @param {number} keyboardStep
 * @param {number} shiftKeyboardStep
 * @returns {function(newValue: number, oldValue:number, isBeingInteractedWithProperty:boolean):number} - returns a function that returns the snap/conserved value
 */
function getKeyboardInputSnappingMapper( getIdealValue, keyboardStep, shiftKeyboardStep ) {

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

ratioAndProportion.register( 'getKeyboardInputSnappingMapper', getKeyboardInputSnappingMapper );
export default getKeyboardInputSnappingMapper;