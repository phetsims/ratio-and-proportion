// Copyright 2020, University of Colorado Boulder

/**
 * Model type that stores the state of the Ratio. This includes its values, the velocity of how it is changing, as well
 * as logic that maintains its "locked" state, when appropriate.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import RAPRatioTuple from './RAPRatioTuple.js';

// The threshold for velocity of a moving ratio value to indicate that it is "moving."
const VELOCITY_THRESHOLD = .01;

const DEFAULT_TERM_VALUE_RANGE = RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

// Use the same value as the no-success region threshold. This cannot be the same as the no-success threshold though
// because that threshold value, by definition, will unlock the ratio, see https://github.com/phetsims/ratio-and-proportion/issues/257#issuecomment-748285667
const LOCK_RATIO_RANGE_MIN = RAPConstants.NO_SUCCESS_VALUE_THRESHOLD + Number.EPSILON;

class RAPRatio {
  constructor() {

    // @public (read-only) {Property.<Range>}
    this.enabledRatioTermsRangeProperty = new Property( DEFAULT_TERM_VALUE_RANGE );

    // REVIEW: Why not construct this with initial values instead of using what seems like arbitrary ones below?

    // @public {Property.<RAPRatioTuple>} - central Property that holds the value of the ratio
    this.tupleProperty = new Property( new RAPRatioTuple( .2, .4 ), {
      valueType: RAPRatioTuple,
      reentrant: true
    } );

    // @public {Property.<number>} - convenience Property based on the tupleProperty get getting/setting/listening
    // to the antecedent only.
    this.antecedentProperty = new DynamicProperty( new Property( this.tupleProperty ), {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ratioTuple => ratioTuple.antecedent,
      inverseMap: antecedent => this.tupleProperty.value.withAntecedent( antecedent )
    } );

    // @public {Property.<number>} - convenience Property based on the tupleProperty get getting/setting/listening
    // to the consequent only.
    this.consequentProperty = new DynamicProperty( new Property( this.tupleProperty ), {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ratioTuple => ratioTuple.consequent,
      inverseMap: consequent => this.tupleProperty.value.withConsequent( consequent )
    } );

    // @public (read-only) - the velocity of each ratio value changing, adjusted in step
    this.changeInAntecedentProperty = new NumberProperty( 0 );
    this.changeInConsequentProperty = new NumberProperty( 0 );

    // @private - keep track of previous values to calculate the change
    this.previousAntecedentProperty = new NumberProperty( this.antecedentProperty.value );
    this.previousConsequentProperty = new NumberProperty( this.consequentProperty.value );
    this.stepCountTracker = 0; // Used for keeping track of how often dVelocity is checked.

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockedProperty = new BooleanProperty( false );

    // @private - To avoid an infinite loop as setting the tupleProperty from inside its lock-ratio-support
    // listener. This is predominately needed because even same antecedent/consequent values get wrapped in a new
    // RAPRatioTuple instance.
    this.lockRatioListenerEnabled = true;

    // REVIEW: The linkage below seems quite complex, and appears to be a consequence of the design choice to use a
    // tuple for the ratio instead of just independent antecedent and consequent properties.  And yet, there are derived
    // versions of antecedent and consequent properties above anyway.  Wouldn't it be simpler to do away with the tuple
    // and thus never be in a situation where it needed to be recreated because half of it had changed?

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
          assert && assert( RAPConstants.toFixed( tuple.ratio ) === RAPConstants.toFixed( oldTuple.ratio ),
            'if both values change while locked, the ratio should be maintained.' );
        }

        if ( antecedentChanged ) {
          newConsequent = newAntecedent / previousRatio;
        }
        else if ( consequentChanged ) {
          newAntecedent = newConsequent * previousRatio;
        }

        const newRatioTuple = this.clampRatioTupleValuesInRange( new RAPRatioTuple( newAntecedent, newConsequent ), previousRatio );

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
      const newAntecedent = enabledRange.constrainValue( this.antecedentProperty.value );
      const newConsequent = enabledRange.constrainValue( this.consequentProperty.value );
      this.tupleProperty.value = new RAPRatioTuple( newAntecedent, newConsequent );
    } );
  }

  /**
   * While keeping the same ratio, make sure that both ratio terms are within the provided range
   * @private
   * @param {RAPRatioTuple} ratioTuple
   * @param {number} ratio - to base clamping on
   * @param {Range} range
   * @returns {RAPRatioTuple}
   */
  clampRatioTupleValuesInRange( ratioTuple, ratio, range = this.enabledRatioTermsRangeProperty.value ) {
    let antecedent = ratioTuple.antecedent;
    let consequent = ratioTuple.consequent;

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

    // Alter the antecedent to match the target ratio
    const currentRatioTuple = this.tupleProperty.value;

    // Snap the smaller value, because that will yield a smaller snap distance, see https://github.com/phetsims/ratio-and-proportion/issues/257
    if ( currentRatioTuple.antecedent > currentRatioTuple.consequent ) {
      currentRatioTuple.antecedent = targetRatio * currentRatioTuple.consequent;
    }
    else {
      currentRatioTuple.consequent = currentRatioTuple.antecedent / targetRatio;
    }

    // Then clamp to be within the currently enabled range.
    const newRatioTuple = this.clampRatioTupleValuesInRange( currentRatioTuple, targetRatio );
    assert && assert( newRatioTuple !== currentRatioTuple,
      'Cannot mutate here, as we rely on notifications below when setting the Property.' );

    // Make sure that the lock ratio listener won't try to mutate the new RAPRatioTuple
    this.lockRatioListenerEnabled = false;
    this.tupleProperty.value = newRatioTuple;
    this.lockRatioListenerEnabled = true;
  }

  /**
   * Whether or not the two hands are moving fast enough together in the same direction. This indicates a bimodal interaction.
   * @public
   * @returns {boolean}
   */
  movingInDirection() {
    const bothMoving = this.changeInAntecedentProperty.value !== 0 && this.changeInConsequentProperty.value !== 0;

    // both hands should be moving in the same direction
    const movingInSameDirection = this.changeInAntecedentProperty.value > 0 === this.changeInConsequentProperty.value > 0;

    const movingFastEnough = Math.abs( this.changeInAntecedentProperty.value ) > VELOCITY_THRESHOLD && // antecedent past threshold
                             Math.abs( this.changeInConsequentProperty.value ) > VELOCITY_THRESHOLD; // consequent past threshold

    // Ignore the speed component when the ratio is locked
    return bothMoving && movingInSameDirection && ( movingFastEnough || this.lockedProperty.value );
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
    if ( ++this.stepCountTracker % 30 === 0 ) {
      this.calculateCurrentVelocity( this.previousAntecedentProperty, this.antecedentProperty.value, this.changeInAntecedentProperty );
      this.calculateCurrentVelocity( this.previousConsequentProperty, this.consequentProperty.value, this.changeInConsequentProperty );
    }
  }

  /**
   * @public
   */
  reset() {

    // it is easiest if this is reset first
    this.lockedProperty.reset();

    this.antecedentProperty.reset();
    this.consequentProperty.reset();

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
