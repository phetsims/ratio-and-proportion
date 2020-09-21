// Copyright 2020, University of Colorado Boulder

/**
 * Model type that stores the state of the Ratio. This includes its values, the velocity of how it is changing, as well
 * as logic that maintains its "locked" state, when appropriate.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';

// The threshold for velocity of a moving ratio value to indivate that it is "moving."
const VELOCITY_THRESHOLD = .01;

const DEFAULT_VALUE_RANGE = RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE;
const LOCK_RATIO_RANGE_MIN = .05;

class RAPRatio {
  constructor() {

    // @public (read-only)
    this.enabledRatioComponentsRangeProperty = new Property( RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE );

    // @public - settable positions of the two values on the screen
    this.numeratorProperty = new NumberProperty( .2, {
      reentrant: true
    } );
    this.denominatorProperty = new NumberProperty( .4, {
      reentrant: true
    } );

    // @public (read-only) - the velocity of each ratio value changing, adjusted in step
    this.changeInNumeratorProperty = new NumberProperty( 0 );
    this.changeInDenominatorProperty = new NumberProperty( 0 );

    // @private - keep track of previous values to calculate the change
    this.previousNumeratorProperty = new NumberProperty( this.numeratorProperty.value );
    this.previousDenominatorProperty = new NumberProperty( this.denominatorProperty.value );
    this.stepCountTracker = 0; // Used for

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockedProperty = new BooleanProperty( false );

    // Avoid reentrancy by guarding each time one valueProperty change then sets the other.
    let adjustingFromLock = false;

    this.numeratorProperty.lazyLink( ( newValue, oldValue ) => {

      // Clamp to decimal places to make sure that javascript rounding errors don't effect some views for interpreting position
      this.numeratorProperty.value = Utils.toFixedNumber( newValue, 6 );

      if ( this.lockedProperty.value && !adjustingFromLock ) {
        const previousRatio = oldValue / this.denominatorProperty.value;
        adjustingFromLock = true;

        // TODO: should this use the enabled range instead of the default?
        this.denominatorProperty.value = Utils.clamp( newValue / previousRatio, DEFAULT_VALUE_RANGE.min, DEFAULT_VALUE_RANGE.max );
        if ( this.denominatorProperty.value === DEFAULT_VALUE_RANGE.min || this.denominatorProperty.value === DEFAULT_VALUE_RANGE.max ) {
          this.numeratorProperty.value = previousRatio * this.denominatorProperty.value;
        }
        adjustingFromLock = false;
      }
    } );
    this.denominatorProperty.lazyLink( ( newValue, oldValue ) => {

      // Clamp to decimal places to make sure that javascript rounding errors don't effect some views for interpreting position
      this.denominatorProperty.value = Utils.toFixedNumber( newValue, 6 );

      if ( this.lockedProperty.value && !adjustingFromLock ) {
        const previousRatio = this.numeratorProperty.value / oldValue;
        adjustingFromLock = true;
        this.numeratorProperty.value = Utils.clamp( newValue * previousRatio, DEFAULT_VALUE_RANGE.min, DEFAULT_VALUE_RANGE.max );
        if ( this.numeratorProperty.value === DEFAULT_VALUE_RANGE.min || this.numeratorProperty.value === DEFAULT_VALUE_RANGE.max ) {
          this.denominatorProperty.value = this.numeratorProperty.value / previousRatio;
        }
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