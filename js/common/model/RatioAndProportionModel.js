// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionConstants from '../RatioAndProportionConstants.js';

// The threshold for velocity of a moving ratio value to indivate that it is "moving."
const VELOCITY_THRESHOLD = .01;

// constant to help achieve feedback in 40% of the visual screen height.
const FITNESS_TOLERANCE_FACTOR = 0.5;

// The value in which when either the left or right value is less than this, the ratio cannot be "in proportion".
// Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
const NO_SUCCUSS_VALUE_THRESHOLD = .021;

const VALUE_RANGE_MIN = 0;
const VALUE_RANGE = new Range( VALUE_RANGE_MIN, 1 );
const LOCK_RATIO_RANGE_MIN = .05;

const RIGHT_VALUE_ZERO_REPLACEMENT = .000001;

class RatioAndProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.targetRatioProperty = new NumberProperty( .5 );

    // @public
    // TODO: perhaps rename "value" to "position"
    this.valueRange = VALUE_RANGE;
    this.enabledValueRangeProperty = new Property( this.valueRange );

    // @public - settable positions of the two values on the screen
    this.leftValueProperty = new NumberProperty( .2, {
      reentrant: true
    } );
    this.rightValueProperty = new NumberProperty( .4, {
      reentrant: true
    } );

    // @public - the current value of the ratio
    this.currentRatioProperty = new DerivedProperty( [ this.leftValueProperty, this.rightValueProperty ],
      ( left, right ) => {

        // Instead of dividing by zero, just say this case is not in proportion
        if ( right === 0 ) {
          right = RIGHT_VALUE_ZERO_REPLACEMENT; // calculate the fitness as if the value was very small, but not 0
        }

        return left / right;
      }, { valueType: 'number' } );

    // Clamp to decimal places to make sure that javascript rounding errors don't effect some views for interpreting position
    this.leftValueProperty.link( value => {
      this.leftValueProperty.value = Utils.toFixedNumber( value, 6 );
    } );
    this.rightValueProperty.link( value => {
      this.rightValueProperty.value = Utils.toFixedNumber( value, 6 );
    } );

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockRatioProperty = new BooleanProperty( false );

    // @public (read-only) - the Range that the ratioFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @private
    this.unclampedFitnessRange = new Range( -50, 1 );

    // @public (read-only) - the velocity of each value changing, adjusted in step
    this.leftVelocityProperty = new NumberProperty( 0 );
    this.rightVelocityProperty = new NumberProperty( 0 );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Can be between 0 and 1, if 1, the proportion of the two values is
    // exactly the value of the targetRatioProperty. If zero, it is outside the tolerance allowed for the proportion.
    this.unclampedFitnessProperty = new DerivedProperty( [
      this.leftValueProperty,
      this.rightValueProperty,
      this.targetRatioProperty
    ], ( leftValue, rightValue, ratio ) => {

      // Instead of dividing by zero, just say this case is not in proportion
      if ( rightValue === 0 ) {
        rightValue = RIGHT_VALUE_ZERO_REPLACEMENT; // calculate the fitness as if the value was very small, but not 0
      }

      assert && assert( !isNaN( leftValue / rightValue ), 'ratio should be defined' );
      assert && assert( leftValue / rightValue >= 0, 'ratio should be positive' );

      let unclampedFitness = this.calculateFitness( leftValue, rightValue, ratio );

      // If either value is small enough, then we don't allow an "in proportion" fitness level, so make it just below that threshold.
      if ( this.inProportion( unclampedFitness ) && this.valuesTooSmallForSuccess() ) {
        unclampedFitness = this.fitnessRange.max - this.getInProportionThreshold() - .01;
      }

      phet.log && phet.log( `left: ${leftValue},\n right: ${rightValue},\n distance: ${Math.abs( rightValue - leftValue )},\n current ratio: ${leftValue / rightValue},\n unclampedFitness: ${unclampedFitness}\n\n` );

      return unclampedFitness;
    }, {
      isValidValue: value => this.unclampedFitnessRange.contains( value )
    } );


    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. clamped within this.fitnessRange. If at max (1), the proportion of the two values is
    // exactly the value of the targetRatioProperty. If min (0), it is outside the tolerance allowed for the proportion
    // to give many feedbacks.
    this.ratioFitnessProperty = new DerivedProperty( [ this.unclampedFitnessProperty ],
      unclampedFitness => Utils.clamp( unclampedFitness, this.fitnessRange.min, this.fitnessRange.max ), {
        isValidValue: value => this.fitnessRange.contains( value )
      } );

    // @public - true before and until first user interaction with the simulation. Reset will apply to this Property.
    this.firstInteractionProperty = new BooleanProperty( true );

    // @private
    this.previousLeftValueProperty = new NumberProperty( this.leftValueProperty.value );
    this.previousRightValueProperty = new NumberProperty( this.rightValueProperty.value );
    this.stepCountTracker = 0;

    // Avoid reentrancy by guarding each time one valueProperty change then sets the other.
    let adjustingFromLock = false;

    this.leftValueProperty.lazyLink( ( newValue, oldValue ) => {
      if ( this.lockRatioProperty.value && !adjustingFromLock ) {
        const previousRatio = oldValue / this.rightValueProperty.value;
        adjustingFromLock = true;
        this.rightValueProperty.value = Utils.clamp( newValue / previousRatio, this.valueRange.min, this.valueRange.max );
        if ( this.rightValueProperty.value === this.valueRange.min || this.rightValueProperty.value === this.valueRange.max ) {
          this.leftValueProperty.value = previousRatio * this.rightValueProperty.value;
        }
        adjustingFromLock = false;
      }
    } );
    this.rightValueProperty.lazyLink( ( newValue, oldValue ) => {
      if ( this.lockRatioProperty.value && !adjustingFromLock ) {
        const previousRatio = this.leftValueProperty.value / oldValue;
        adjustingFromLock = true;
        this.leftValueProperty.value = Utils.clamp( newValue * previousRatio, this.valueRange.min, this.valueRange.max );
        if ( this.leftValueProperty.value === this.valueRange.min || this.leftValueProperty.value === this.valueRange.max ) {
          this.rightValueProperty.value = this.leftValueProperty.value / previousRatio;
        }
        adjustingFromLock = false;
      }
    } );

    // This must be done here, because of the reentrant nature of how fitness changes when the ratio is locked
    this.targetRatioProperty.link( () => {
      this.lockRatioProperty.value = false;
    } );

    this.lockRatioProperty.link( ratioLocked => {
      this.enabledValueRangeProperty.value = new Range( ratioLocked ? LOCK_RATIO_RANGE_MIN : VALUE_RANGE_MIN, VALUE_RANGE.max );
    } );

    this.enabledValueRangeProperty.link( enabledRange => {
      const clampPropertyIntoRange = property => !enabledRange.contains( property.value ) && property.set( enabledRange.constrainValue( property.value ) );
      clampPropertyIntoRange( this.leftValueProperty );
      clampPropertyIntoRange( this.rightValueProperty );
    } );
  }

  /**
   * fitness according to treating the right value as "correct" in relation to the target ratio
   * @param {number} left
   * @param {number} rightOptimal
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  fitnessBasedOnLeft( left, rightOptimal, targetRatio ) {
    return 1 - FITNESS_TOLERANCE_FACTOR * Math.abs( left - targetRatio * rightOptimal );
  }

  /**
   * fitness according to treating the left value as "correct" in relation to the target ratio
   * @param {number} leftOptimal
   * @param {number} right
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  fitnessBasedOnRight( leftOptimal, right, targetRatio ) {
    return 1 - FITNESS_TOLERANCE_FACTOR * Math.abs( right - leftOptimal / targetRatio );
  }

  /**
   *
   * @param {number} leftValue - from leftValueProperty
   * @param {number} rightValue - from rightValueProperty
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  calculateFitness( leftValue, rightValue, targetRatio ) {

    // multiply because the model values only span from 0-1
    const left = leftValue * 10;
    const right = rightValue * 10;
    return Math.min( this.fitnessBasedOnLeft( left, right, targetRatio ), this.fitnessBasedOnRight( left, right, targetRatio ) );
  }

  /**
   * Get the minimum fitness value (unclamped) for the provided target ratio
   * @public
   * @returns {number}
   */
  getMinFitness( ratio = this.targetRatioProperty.value ) {
    const minRatioFitness = this.calculateFitness( this.valueRange.min, this.valueRange.max, ratio );
    const maxRatioFitness = this.calculateFitness( this.valueRange.max, RIGHT_VALUE_ZERO_REPLACEMENT, ratio );
    return Math.min( minRatioFitness, maxRatioFitness );
  }

  /**
   * If either value is smaller than a threshold, then some model functionality changes. This function will return true
   * when the model is in that state. When true, one or both value is too small to allow for a success state.
   * @public
   * @returns {boolean}
   */
  valuesTooSmallForSuccess() {
    return this.leftValueProperty.value <= NO_SUCCUSS_VALUE_THRESHOLD || this.rightValueProperty.value <= NO_SUCCUSS_VALUE_THRESHOLD;
  }

  /**
   * Whether or not the two hands are moving fast enough together in the same direction. This indicates a bimodal interaction.
   * @public
   * @returns {boolean}
   */
  movingInDirection() {
    const bothMoving = this.leftVelocityProperty.value !== 0 && this.rightVelocityProperty.value !== 0;

    // both hands should be moving in the same direction
    const movingInSameDirection = this.leftVelocityProperty.value > 0 === this.rightVelocityProperty.value > 0;

    const movingFastEnough = Math.abs( this.leftVelocityProperty.value ) > VELOCITY_THRESHOLD && // right past threshold
                             Math.abs( this.rightVelocityProperty.value ) > VELOCITY_THRESHOLD; // right past threshold

    // Ignore the speed component when the ratio is locked
    return bothMoving && movingInSameDirection && ( movingFastEnough || this.lockRatioProperty.value );
  }

  /**
   * @public
   * @returns {number}
   */
  getInProportionThreshold() {
    let threshold = RatioAndProportionConstants.IN_PROPORTION_FITNESS_THRESHOLD;
    if ( this.movingInDirection() ) {
      threshold = RatioAndProportionConstants.MOVING_IN_PROPORTION_FITNESS_THRESHOLD;
    }
    return threshold;
  }

  /**
   * This is the sim's definition of if the ratio is in the "success" metric, what we call "in proportion." This changes
   * based on if moving in proportion (bimodal interaction), or not.
   * @public
   * @param {number} [fitness] - if provided, calculate if this fitness is in proportion
   * @returns {boolean}
   */
  inProportion( fitness = this.ratioFitnessProperty.value ) {
    return fitness > this.fitnessRange.max - this.getInProportionThreshold();
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
   * @override
   */
  step() {

    // only recalculate every X steps to help smooth out noise
    if ( ++this.stepCountTracker % 30 === 0 ) {
      this.calculateCurrentVelocity( this.previousLeftValueProperty, this.leftValueProperty.value, this.leftVelocityProperty );
      this.calculateCurrentVelocity( this.previousRightValueProperty, this.rightValueProperty.value, this.rightVelocityProperty );
    }
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {

    // it is easiest if this is reset first
    this.lockRatioProperty.reset();

    this.targetRatioProperty.reset();
    this.leftValueProperty.reset();
    this.rightValueProperty.reset();
    this.enabledValueRangeProperty.reset();
    this.firstInteractionProperty.reset();
  }
}

ratioAndProportion.register( 'RatioAndProportionModel', RatioAndProportionModel );
export default RatioAndProportionModel;