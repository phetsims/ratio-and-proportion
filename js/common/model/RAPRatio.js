// Copyright 2020, University of Colorado Boulder

/**
 * Model type that stores the state of the Ratio. This includes its values, the velocity of how it is changing, as well
 * as logic that maintains its "locked" state, when appropriate.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import RAPRatioTuple from './RAPRatioTuple.js';

// The threshold for velocity of a moving ratio value to indicate that it is "moving."
const VELOCITY_THRESHOLD = .01;

// How often (in frames) to capture the change in ratio values for the ratio's "velocity"
const STEP_FRAME_GRANULARITY = 30;

const DEFAULT_TERM_VALUE_RANGE = RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

// Use the same value as the no-success region threshold. This cannot be the same as the no-success threshold though
// because that threshold value, by definition, will unlock the ratio, see https://github.com/phetsims/ratio-and-proportion/issues/257#issuecomment-748285667
const LOCK_RATIO_RANGE_MIN = RAPConstants.NO_SUCCESS_VALUE_THRESHOLD + Number.EPSILON;

class RAPRatio {

  /**
   * @param {number} initialAntecedent
   * @param {number} initialConsequent
   */
  constructor( initialAntecedent, initialConsequent ) {

    // @public (read-only) {Property.<Range>}
    this.enabledRatioTermsRangeProperty = new Property( DEFAULT_TERM_VALUE_RANGE );

    // @public {Property.<RAPRatioTuple>} - Central Property that holds the value of the ratio. Using a tuple that holds
    // both the antecedent and consequent values as a single data structure is vital for changing both hands at once, and
    // in supporting the "locked ratio" state. Otherwise there are complicated reentrant cases where changing the
    // antecedent cascades to the consequent to snap it back into ratio. Thus the creation of RAPRatioTuple.
    this.tupleProperty = new Property( new RAPRatioTuple( initialAntecedent, initialConsequent ), {
      valueType: RAPRatioTuple,
      useDeepEquality: true,
      reentrant: true
    } );

    // @private - The change in ratio values since last capture. The frequency (or granularity) of this value
    // is determined by STEP_FRAME_GRANULARITY.
    this.changeInAntecedentProperty = new NumberProperty( 0 );
    this.changeInConsequentProperty = new NumberProperty( 0 );

    // @private - keep track of previous values to calculate the change
    this.previousAntecedentProperty = new NumberProperty( this.tupleProperty.value.antecedent );
    this.previousConsequentProperty = new NumberProperty( this.tupleProperty.value.consequent );
    this.stepCountTracker = 0; // Used for keeping track of how often dVelocity is checked.

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockedProperty = new BooleanProperty( false );

    // @public - if the ratio is in the "moving in direction" state: whether or not the two hands are moving fast
    // enough together in the same direction. This indicates, among other things a bimodal interaction.
    this.movingInDirectionProperty = new DerivedProperty( [
      this.changeInAntecedentProperty,
      this.changeInConsequentProperty,
      this.lockedProperty
    ], ( changeInAntecedent, changeInConsequent, ratioLocked ) => {
      const bothMoving = changeInAntecedent !== 0 && changeInConsequent !== 0;

      // both hands should be moving in the same direction
      const movingInSameDirection = changeInAntecedent > 0 === changeInConsequent > 0;

      const movingFastEnough = Math.abs( changeInAntecedent ) > VELOCITY_THRESHOLD && // antecedent past threshold
                               Math.abs( changeInConsequent ) > VELOCITY_THRESHOLD; // consequent past threshold

      // Ignore the speed component when the ratio is locked
      return bothMoving && movingInSameDirection && ( movingFastEnough || ratioLocked );
    } );

    // @private - To avoid an infinite loop as setting the tupleProperty from inside its lock-ratio-support
    // listener. This is predominately needed because even same antecedent/consequent values get wrapped in a new
    // RAPRatioTuple instance.
    this.lockRatioListenerEnabled = true;

    // Listener that will handle keeping both ratio tuple values in sync when the ratio is locked.
    this.tupleProperty.link( ( tuple, oldTuple ) => {
      if ( this.lockedProperty.value && this.lockRatioListenerEnabled ) {
        assert && assert( oldTuple, 'need an old value to compute locked ratio values' );

        const antecedentChanged = tuple.antecedent !== oldTuple.antecedent;
        const consequentChanged = tuple.consequent !== oldTuple.consequent;
        const previousRatio = oldTuple.getRatio();

        let newAntecedent = tuple.antecedent;
        let newConsequent = tuple.consequent;

        if ( this.enabledRatioTermsRangeProperty.value.contains( oldTuple.antecedent ) &&
             this.enabledRatioTermsRangeProperty.value.contains( oldTuple.consequent ) &&
             antecedentChanged && consequentChanged ) {
          assert && assert( RAPConstants.toFixed( tuple.getRatio() ) === RAPConstants.toFixed( oldTuple.getRatio() ),
            'if both values change while locked, the ratio should be maintained.' );
        }

        if ( antecedentChanged ) {
          newConsequent = newAntecedent / previousRatio;
        }
        else if ( consequentChanged ) {
          newAntecedent = newConsequent * previousRatio;
        }

        const newRatioTuple = this.clampRatioTupleValuesInRange( newAntecedent, newConsequent, previousRatio );

        // guard against reentrancy in this case.
        this.lockRatioListenerEnabled = false;
        this.tupleProperty.value = newRatioTuple;
        this.lockRatioListenerEnabled = true;
      }
    } );

    this.lockedProperty.link( ratioLocked => {
      this.enabledRatioTermsRangeProperty.value = new Range( ratioLocked ? LOCK_RATIO_RANGE_MIN : DEFAULT_TERM_VALUE_RANGE.min, DEFAULT_TERM_VALUE_RANGE.max );
    } );

    this.enabledRatioTermsRangeProperty.link( enabledRange => {
      const currentTuple = this.tupleProperty.value;
      const newAntecedent = enabledRange.constrainValue( currentTuple.antecedent );
      const newConsequent = enabledRange.constrainValue( currentTuple.consequent );

      // new instance to trigger notifications
      this.tupleProperty.value = new RAPRatioTuple( newAntecedent, newConsequent );
    } );
  }

  /**
   * While keeping the same ratio, make sure that both ratio terms are within the provided range
   * @private
   * @param {number} antecedent
   * @param {number} consequent
   * @param {number} ratio - to base clamping on
   * @param {Range} [range]
   * @returns {RAPRatioTuple} - a new RAPRatioTuple, not mutated
   */
  clampRatioTupleValuesInRange( antecedent, consequent, ratio, range = this.enabledRatioTermsRangeProperty.value ) {

    // Handle if the antecedent is out of range
    if ( !range.contains( antecedent ) ) {
      antecedent = Utils.clamp( antecedent, range.min, range.max );
      consequent = antecedent / ratio;
    }

    // Handle if the consequent is out of range
    if ( !range.contains( consequent ) ) {
      consequent = Utils.clamp( consequent, range.min, range.max );
      antecedent = consequent * ratio;
    }

    assert && assert( range.contains( consequent ) );
    assert && assert( range.contains( antecedent ) );
    return new RAPRatioTuple( antecedent, consequent );
  }

  /**
   * @param {number} targetRatio
   * @public
   */
  setRatioToTarget( targetRatio ) {
    const currentRatioTuple = this.tupleProperty.value;

    let antecedent = currentRatioTuple.antecedent;
    let consequent = currentRatioTuple.consequent;

    // Snap the smaller value, because that will yield a smaller snap distance, see https://github.com/phetsims/ratio-and-proportion/issues/257
    if ( antecedent < consequent ) {
      antecedent = targetRatio * consequent;
    }
    else {
      consequent = antecedent / targetRatio;
    }

    // Then clamp to be within the currently enabled range.
    const newRatioTuple = this.clampRatioTupleValuesInRange( antecedent, consequent, targetRatio );
    assert && assert( newRatioTuple !== currentRatioTuple,
      'Cannot mutate here, as we rely on notifications below when setting the Property.' );

    // Make sure that the lock ratio listener won't try to mutate the new RAPRatioTuple
    this.lockRatioListenerEnabled = false;
    this.tupleProperty.value = newRatioTuple;
    this.lockRatioListenerEnabled = true;
  }

  /**
   * @public
   * @returns {number}
   */
  get currentRatio() {
    return this.tupleProperty.value.getRatio();
  }

  /**
   * @private
   * @param {Property.<number>} previousValueProperty
   * @param {number} currentValue
   * @param {Property.<number>} currentVelocityProperty
   */
  calculateCurrentVelocity( previousValueProperty, currentValue, currentVelocityProperty ) {
    currentVelocityProperty.value = currentValue - previousValueProperty.value;
    previousValueProperty.value = currentValue;
  }

  /**
   * @public
   */
  step() {

    // only recalculate every X steps to help smooth out noise
    if ( ++this.stepCountTracker % STEP_FRAME_GRANULARITY === 0 ) {
      const currentTuple = this.tupleProperty.value;
      this.calculateCurrentVelocity( this.previousAntecedentProperty, currentTuple.antecedent, this.changeInAntecedentProperty );
      this.calculateCurrentVelocity( this.previousConsequentProperty, currentTuple.consequent, this.changeInConsequentProperty );
    }
  }

  /**
   * @public
   */
  reset() {

    // it is easiest if this is reset first
    this.lockedProperty.reset();

    this.tupleProperty.reset();

    this.enabledRatioTermsRangeProperty.reset();
    this.changeInAntecedentProperty.reset();
    this.changeInConsequentProperty.reset();
    this.previousAntecedentProperty.reset();
    this.previousConsequentProperty.reset();
    this.stepCountTracker = 0;
    this.lockRatioListenerEnabled = true;
  }
}

ratioAndProportion.register( 'RAPRatio', RAPRatio );
export default RAPRatio;
