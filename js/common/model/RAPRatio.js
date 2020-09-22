// Copyright 2020, University of Colorado Boulder

/**
 * Model type that stores the state of the Ratio. This includes its values, the velocity of how it is changing, as well
 * as logic that maintains its "locked" state, when appropriate.
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

// The threshold for velocity of a moving ratio value to indivate that it is "moving."
const VELOCITY_THRESHOLD = .01;

const DEFAULT_VALUE_RANGE = RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE;
const LOCK_RATIO_RANGE_MIN = .05;

class RAPRatio {
  constructor() {

    // @public (read-only)
    this.enabledRatioComponentsRangeProperty = new Property( RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE );

    // @public {Property.<RAPRatioTuple>} - central Property that holds the value of the ratio
    // TODO: more spots could use this instead of numerator/denominator Properties https://github.com/phetsims/ratio-and-proportion/issues/181
    this.ratioTupleProperty = new Property( new RAPRatioTuple( .2, .4 ), {
      valueType: RAPRatioTuple,
      reentrant: true
    } );

    // @public {Property.<number>} - convenience Property based on the ratioTupleProperty get getting/setting/listening
    // to the numerator only.
    this.numeratorProperty = new DynamicProperty( new Property( this.ratioTupleProperty ), {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ratioTuple => ratioTuple.numerator,
      inverseMap: numerator => this.ratioTupleProperty.value.withNumerator( numerator )
    } );

    // @public {Property.<number>} - convenience Property based on the ratioTupleProperty get getting/setting/listening
    // to the denominator only.
    this.denominatorProperty = new DynamicProperty( new Property( this.ratioTupleProperty ), {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ratioTuple => ratioTuple.denominator,
      inverseMap: denominator => this.ratioTupleProperty.value.withDenominator( denominator )
    } );

    // @public (read-only) - the velocity of each ratio value changing, adjusted in step
    this.changeInNumeratorProperty = new NumberProperty( 0 );
    this.changeInDenominatorProperty = new NumberProperty( 0 );

    // @private - keep track of previous values to calculate the change
    // TODO: if needed, make this previousRatioTuple https://github.com/phetsims/ratio-and-proportion/issues/181
    this.previousNumeratorProperty = new NumberProperty( this.numeratorProperty.value );
    this.previousDenominatorProperty = new NumberProperty( this.denominatorProperty.value );
    this.stepCountTracker = 0; // Used for keeping track of how often dVelocity is checked.

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockedProperty = new BooleanProperty( false );

    // Clamp to decimal places to make sure that javascript rounding errors don't effect some views for interpreting position
    this.ratioTupleProperty.link( tuple => {
      tuple.numerator = Utils.toFixedNumber( tuple.numerator, 6 );
      tuple.denominator = Utils.toFixedNumber( tuple.denominator, 6 );
    } );

    // To avoid an infinite loop as setting the ratioTupleProperty from inside its lock-ratio-support listener. This is
    // predominately needed because even same numerator/denominator values get wrapped in a new RAPRatioTuple instance.
    let adjustingFromLock = false;

    // Listener that will handle keeping both ratio tuple values in sync when the ratio is locked.
    this.ratioTupleProperty.link( ( tuple, oldTuple ) => {
      if ( this.lockedProperty.value && !adjustingFromLock ) {
        assert && assert( oldTuple, 'need an old value to compute locked ratio values' );

        const numeratorChanged = tuple.numerator !== oldTuple.numerator;
        const denominatorChanged = tuple.denominator !== oldTuple.denominator;
        const previousRatio = oldTuple.getRatio();

        let newNumerator = tuple.numerator;
        let newDenominator = tuple.denominator;

        assert && assert( !( numeratorChanged && denominatorChanged ), 'both values should not change when ratio is locked' );

        if ( numeratorChanged ) {
          newDenominator = newNumerator / previousRatio;
        }
        else if ( denominatorChanged ) {
          newNumerator = newDenominator * previousRatio;
        }

        // Handle if the numerator is out of range
        if ( !DEFAULT_VALUE_RANGE.contains( newNumerator ) ) {
          newNumerator = Utils.clamp( newNumerator, DEFAULT_VALUE_RANGE.min, DEFAULT_VALUE_RANGE.max );
          newDenominator = newNumerator / previousRatio;
        }

        // Handle if the denominator is out of range
        if ( !DEFAULT_VALUE_RANGE.contains( newDenominator ) ) {
          newDenominator = Utils.clamp( newDenominator, DEFAULT_VALUE_RANGE.min, DEFAULT_VALUE_RANGE.max );
          newNumerator = newDenominator * previousRatio;
        }

        assert && assert( DEFAULT_VALUE_RANGE.contains( newDenominator ) );
        assert && assert( DEFAULT_VALUE_RANGE.contains( newNumerator ) );

        // guard against reentrancy in this case.
        adjustingFromLock = true;
        this.ratioTupleProperty.value = new RAPRatioTuple( newNumerator, newDenominator ).toFixed( 6 );
        adjustingFromLock = false;
      }
    } );

    this.lockedProperty.link( ratioLocked => {
      this.enabledRatioComponentsRangeProperty.value = new Range( ratioLocked ? LOCK_RATIO_RANGE_MIN : DEFAULT_VALUE_RANGE.min, DEFAULT_VALUE_RANGE.max );
    } );

    this.enabledRatioComponentsRangeProperty.link( enabledRange => {
      const clampPropertyIntoRange = property => !enabledRange.contains( property.value ) && property.set( enabledRange.constrainValue( property.value ) );
      clampPropertyIntoRange( this.numeratorProperty );
      clampPropertyIntoRange( this.denominatorProperty );
    } );
  }

  // TODO: this.lockRatioAt( 75 ), https://github.com/phetsims/ratio-and-proportion/issues/146

  /**
   * Whether or not the two hands are moving fast enough together in the same direction. This indicates a bimodal interaction.
   * @public
   * @returns {boolean}
   */
  movingInDirection() {
    const bothMoving = this.changeInNumeratorProperty.value !== 0 && this.changeInDenominatorProperty.value !== 0;

    // both hands should be moving in the same direction
    const movingInSameDirection = this.changeInNumeratorProperty.value > 0 === this.changeInDenominatorProperty.value > 0;

    const movingFastEnough = Math.abs( this.changeInNumeratorProperty.value ) > VELOCITY_THRESHOLD && // numerator past threshold
                             Math.abs( this.changeInDenominatorProperty.value ) > VELOCITY_THRESHOLD; // denominator past threshold

    // Ignore the speed component when the ratio is locked
    return bothMoving && movingInSameDirection && ( movingFastEnough || this.lockedProperty.value );
  }

  /**
   * @public
   * @returns {number}
   */
  get currentRatio() {
    return this.denominatorProperty.value === 0 ? Number.POSITIVE_INFINITY : this.numeratorProperty.value / this.denominatorProperty.value;
  }

  /**
   * @private
   * @param {Property.<number>}previousValueProperty
   * @param {number} currentValue
   * @param {Property.<number>} velocityProperty
   */
  calculateCurrentVelocity( previousValueProperty, currentValue, velocityProperty ) {
    velocityProperty.value = currentValue - previousValueProperty.value;
    previousValueProperty.value = currentValue;
  }

  /**
   * @public
   */
  step() {

    // only recalculate every X steps to help smooth out noise
    if ( ++this.stepCountTracker % 30 === 0 ) {
      this.calculateCurrentVelocity( this.previousNumeratorProperty, this.numeratorProperty.value, this.changeInNumeratorProperty );
      this.calculateCurrentVelocity( this.previousDenominatorProperty, this.denominatorProperty.value, this.changeInDenominatorProperty );
    }
  }

  /**
   * @public
   */
  reset() {

    // it is easiest if this is reset first
    this.lockedProperty.reset();

    this.numeratorProperty.reset();
    this.denominatorProperty.reset();

    this.enabledRatioComponentsRangeProperty.reset();
    this.changeInNumeratorProperty.reset();
    this.changeInDenominatorProperty.reset();
    this.previousNumeratorProperty.reset();
    this.previousDenominatorProperty.reset();
    this.stepCountTracker = 0;
  }
}

ratioAndProportion.register( 'RAPRatio', RAPRatio );
export default RAPRatio;
