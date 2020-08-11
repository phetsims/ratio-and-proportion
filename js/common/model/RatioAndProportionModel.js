// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import RatioAndProportionQueryParameters from '../../common/RatioAndProportionQueryParameters.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionConstants from '../RatioAndProportionConstants.js';

// The threshold for velocity of a moving ratio value to indivate that it is "moving."
const VELOCITY_THRESHOLD = .01;

// The value in which when either the left or right value is less than this, the ratio cannot be "in proportion".
// Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
const NO_SUCCUSS_VALUE_THRESHOLD = .021;

class RatioAndProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( RatioAndProportionQueryParameters.tolerance );

    // @public
    // To avoid divide-by zero errors. NOTE: GridDescriber relies on the min of this mapping to "zero" as it pertains
    // to Interactive description
    this.valueRange = new Range( .0001, 1 );

    const modelBounds = new Bounds2( -.5, this.valueRange.min, .5, this.valueRange.max );

    this.leftPositionProperty = new Vector2Property( new Vector2( 0, .2 ), {
      tandem: tandem.createTandem( 'leftBarProperty' ),
      reentrant: true,
      validBounds: modelBounds
    } );
    this.rightPositionProperty = new Vector2Property( new Vector2( 0, .4 ), {
      tandem: tandem.createTandem( 'rightBarProperty' ),
      reentrant: true,
      validBounds: modelBounds
    } );

    // @public - settable positions of the two values on the screen
    // TODO: this may not be needed because horizontal movement is not important to the model.
    this.leftValueProperty = new DynamicProperty( new Property( this.leftPositionProperty ), {
      bidirectional: true,
      reentrant: true,
      map: vector2 => vector2.y,
      inverseMap: number => this.leftPositionProperty.value.copy().setY( number )
    } );
    this.rightValueProperty = new DynamicProperty( new Property( this.rightPositionProperty ), {
      bidirectional: true,
      reentrant: true,
      map: vector2 => vector2.y,
      inverseMap: number => this.rightPositionProperty.value.copy().setY( number )
    } );

    // @public - when true, moving one ratio value will maintain the current ratio by updating the other value Property
    this.lockRatioProperty = new BooleanProperty( false );

    // @public (read-only) - the Range that the ratioFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @public (read-only) - the velocity of each value changing, adjusted in step
    this.leftVelocityProperty = new NumberProperty( 0 );
    this.rightVelocityProperty = new NumberProperty( 0 );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Can be between 0 and 1, if 1, the proportion of the two values is
    // exactly the value of the ratioProperty. If zero, it is outside the tolerance allowed for the proportion.
    this.ratioFitnessProperty = new DerivedProperty( [
      this.leftValueProperty,
      this.rightValueProperty,
      this.ratioProperty,
      this.toleranceProperty
    ], ( leftValue, rightValue, ratio, tolerance ) => {
      assert && assert( rightValue !== 0, 'cannot divide by zero' );
      assert && assert( !isNaN( leftValue / rightValue ), 'ratio should be defined' );

      // constant to help achieve feedback in 40% of the visual screen height.
      const toleranceFactor = 0.5;

      // fitness according to treating the right value as "correct" in relation to the target ratio
      const fLeft = ( left, rightOptimal, targetRatio ) => 1 - toleranceFactor * Math.abs( left - targetRatio * rightOptimal );

      // fitness according to treating the left value as "correct" in relation to the target ratio
      const fRight = ( leftOptimal, right, targetRatio ) => 1 - toleranceFactor * Math.abs( right - leftOptimal / targetRatio );

      // Calculate both possible fitness values, and take the minimum. In experience this works well at creating a
      // tolerance range that is independent of the target ratio or the positions of the values. This algorithm can
      // make the tolerance of the left value a bit too small for small target ratios.
      const getFitness = ( left, right ) => Math.min( fLeft( left, right, ratio ), fRight( left, right, ratio ) );

      const unclampedFitness = getFitness( leftValue * 10, rightValue * 10 );

      let fitness = Utils.clamp( unclampedFitness, this.fitnessRange.min, this.fitnessRange.max );

      // If either value is small enough, then we don't allow an "in proportion" fitness level, so make it just below that threshold.
      if ( this.inProportion( fitness ) && this.valuesTooSmallForSuccess() ) {
        fitness = this.fitnessRange.max - this.getInProportionThreshold() - .01;
      }

      phet.log && phet.log( `left: ${leftValue},\n right: ${rightValue},\n current ratio: ${leftValue / rightValue},\n fitness: ${fitness}\n\n` );

      return fitness;
    }, {
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

    this.leftPositionProperty.reset();
    this.rightPositionProperty.reset();

    this.ratioProperty.reset();
    this.toleranceProperty.reset();
    this.leftValueProperty.reset();
    this.rightValueProperty.reset();
    this.firstInteractionProperty.reset();
  }
}

ratioAndProportion.register( 'RatioAndProportionModel', RatioAndProportionModel );
export default RatioAndProportionModel;