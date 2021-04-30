// Copyright 2020-2021, University of Colorado Boulder

/**
 * Constants used throughout this simulation. This is a singleton to support PhET-iO instrumentation. On startup, the
 * state of this object is emitted to the PhET-iO data stream.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ratioAndProportion from '../ratioAndProportion.js';

class RAPConstants extends PhetioObject {

  constructor() {
    super( {
        tandem: Tandem.GLOBAL_MODEL.createTandem( 'rapConstants' ),
        phetioType: new IOType( 'RAPConstantsIO', {
          isValidValue: _.stubTrue,
          toStateObject: object => object.toStateObject(),
          superType: IOType.ObjectIO
        } ),
        phetioState: true
      }
    );

    // @public
    this.SCREEN_VIEW_X_MARGIN = 15;

    // @public
    this.SCREEN_VIEW_Y_MARGIN = 15;

    // @public
    this.RATIO_FITNESS_RANGE = new Range( 0, 1 );

    // distance (in fitness) from max fitness that still indicates a successful proportion
    // @public
    this.IN_PROPORTION_FITNESS_THRESHOLD = 0.025;

    // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
    // same direction. See RAPRatio.movingInDirectionProperty
    // @public
    this.MOVING_IN_PROPORTION_FITNESS_THRESHOLD = 0.3;

    // The value to multiple the keyboard step size by to get the shift + keydown step size
    // @public
    this.SHIFT_KEY_MULTIPLIER = 1 / 5;

    // The range that the each ratio component (antecedent/consequent) value can be
    // @public
    this.TOTAL_RATIO_TERM_VALUE_RANGE = new Range( 0, 1 );

    // Consistent way to fix numbers. This should only be used in the view for comparison and display, not in the model, see https://github.com/phetsims/ratio-and-proportion/issues/243
    // @public
    this.toFixed = x => Utils.toFixedNumber( x, 6 );

    // The value in which when either the antecedent or consequent is less than this, the ratio cannot be "in proportion".
    // Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
    // @public
    this.NO_SUCCESS_VALUE_THRESHOLD = 0.01;
  }

  // @public
  toStateObject() {
    return {
      SCREEN_VIEW_X_MARGIN: this.SCREEN_VIEW_X_MARGIN,
      SCREEN_VIEW_Y_MARGIN: this.SCREEN_VIEW_Y_MARGIN,
      RATIO_FITNESS_RANGE: Range.RangeIO.toStateObject( this.RATIO_FITNESS_RANGE ),
      IN_PROPORTION_FITNESS_THRESHOLD: this.IN_PROPORTION_FITNESS_THRESHOLD,
      MOVING_IN_PROPORTION_FITNESS_THRESHOLD: this.MOVING_IN_PROPORTION_FITNESS_THRESHOLD,
      SHIFT_KEY_MULTIPLIER: this.SHIFT_KEY_MULTIPLIER,
      TOTAL_RATIO_TERM_VALUE_RANGE: Range.RangeIO.toStateObject( this.TOTAL_RATIO_TERM_VALUE_RANGE ),
      NO_SUCCESS_VALUE_THRESHOLD: this.NO_SUCCESS_VALUE_THRESHOLD
    };
  }
}

const rapConstants = new RAPConstants();

assert && assert( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min === 0 && rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.max === 1,
  'There are assumptions in the model about ratio terms being normalized, see RAPModel.calculateFitness() before changing and proceed with caution' );

ratioAndProportion.register( 'rapConstants', rapConstants );
export default rapConstants;