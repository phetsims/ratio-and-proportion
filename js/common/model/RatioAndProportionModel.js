// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
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

// For fitness - constant to help achieve feedback in 40% of the visual screen height.
const TOLERANCE_FACTOR = .5;

// The value in which when either the left or right value is less than this, the ratio cannot be "in proportion"
const NO_SUCCUSS_VALUE_THRESHOLD = .05;

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
      validBounds: modelBounds
    } );
    this.rightPositionProperty = new Vector2Property( new Vector2( 0, .4 ), {
      tandem: tandem.createTandem( 'rightBarProperty' ),
      validBounds: modelBounds
    } );

    // @public - settable positions of the two values on the screen
    // TODO: this may not be needed because horizontal movement is not important to the model.
    this.leftValueProperty = new DynamicProperty( new Property( this.leftPositionProperty ), {
      bidirectional: true,
      map: vector2 => vector2.y,
      inverseMap: number => this.leftPositionProperty.value.copy().setY( number )
    } );
    this.rightValueProperty = new DynamicProperty( new Property( this.rightPositionProperty ), {
      bidirectional: true,
      map: vector2 => vector2.y,
      inverseMap: number => this.rightPositionProperty.value.copy().setY( number )
    } );

    // @public (read-only) - the Range that the ratioFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @public (read-only) - the velocity of each value changing, adjusted in step
    this.leftVelocityProperty = new NumberProperty( 0 );
    this.rightVelocityProperty = new NumberProperty( 0 );

    // @public {Property.<number>}
    // How "correct" the proportion currently is. Can be between 0 and 1, if 1, the proportion of the two values is
    // exactly the value of the ratioProperty. If zero, it is outside the tolerance allowed for the proportion.
    this.ratioFitnessProperty = new NumberProperty( 1, {
      isValidValue: value => this.fitnessRange.contains( value )
    } );

    // @public - true before and until first user interaction with the simulation. Reset will apply to this Property.
    this.firstInteractionProperty = new BooleanProperty( true );

    // @private
    this.previousLeftValueProperty = new NumberProperty( this.leftValueProperty.value );
    this.previousRightValueProperty = new NumberProperty( this.rightValueProperty.value );
    this.stepCountTracker = 0;

    // @private - implementation detail, see this.ratioFitnessProperty instead
    this.unclampedFitness = 1;

    this.leftValueProperty.lazyLink( ( newValue, oldValue ) => {
      const previousRatio = oldValue / this.rightValueProperty.value;
      const newRatio = newValue / this.rightValueProperty.value;
      this.adjustFitness( previousRatio, newRatio, newValue, oldValue, this.ratioProperty.value * this.rightValueProperty.value );
    } );
    this.rightValueProperty.lazyLink( ( newValue, oldValue ) => {
      const previousRatio = this.leftValueProperty.value / oldValue;
      const newRatio = this.leftValueProperty.value / newValue;
      this.adjustFitness( previousRatio, newRatio, newValue, oldValue, this.leftValueProperty.value / this.ratioProperty.value );
    } );

    // But how do we know that recalculating this like so works equally well for both values. Still need to come up with a place to solve.
    this.ratioProperty.link( () => this.recalculateFitness() );
  }

  /**
   * Adjust the fitness of the ratio based on a movement of either the left or right values.
   * @private
   * @param previousRatio
   * @param newRatio
   * @param newValue
   * @param oldValue
   * @param idealValue
   */
  adjustFitness( previousRatio, newRatio, newValue, oldValue, idealValue ) {
    const targetRatio = this.ratioProperty.value;


    // If a change would span through the target ratio, then the signs would be different, and so should be treated as
    // two separate adjustments, one going to a max fitness, and then the next going away from max fitness.
    if ( idealValue && newValue !== idealValue && oldValue !== idealValue && newValue > idealValue !== oldValue > idealValue ) {
      idealValue = Utils.toFixedNumber( idealValue, 6 );
      this.adjustFitness( previousRatio, targetRatio, oldValue, idealValue );
      this.adjustFitness( targetRatio, newRatio, idealValue, newValue );
    }
    else {

      const newError = Math.abs( newRatio - targetRatio );
      const previousError = Math.abs( previousRatio - targetRatio );

      assert && assert( newError !== previousError, 'have not thought through this case, but should soon!' );

      const sign = newError > previousError ? -1 : 1;

      const dx = sign * Math.abs( newValue - oldValue );

      this.unclampedFitness = this.unclampedFitness + dx * 10 * TOLERANCE_FACTOR;
      assert && assert( this.unclampedFitness <= 1, 'unclampedFitness should never be larger than 1' );

      this.setFitness( this.unclampedFitness );
    }
  }

  /**
   * @private
   */
  recalculateFitness() {
    const ratio = this.ratioProperty.value;

    // fitness according to treating the right value as "correct" in relation to the target ratio
    const fLeft = ( left, rightOptimal, targetRatio ) => 1 - TOLERANCE_FACTOR * Math.abs( left - targetRatio * rightOptimal );

    // fitness according to treating the left value as "correct" in relation to the target ratio
    const fRight = ( leftOptimal, right, targetRatio ) => 1 - TOLERANCE_FACTOR * Math.abs( right - leftOptimal / targetRatio );

    // Calculate both possible fitness values, and take the minimum. In experience this works well at creating a
    // tolerance range that is independent of the target ratio or the positions of the values. This algorithm can
    // make the tolerance of the left value a bit too small for small target ratios.
    const getFitness = ( left, right ) => Math.min( fLeft( left, right, ratio ), fRight( left, right, ratio ) );

    this.setFitness( getFitness( this.leftValueProperty.value * 10, this.rightValueProperty.value * 10 ) );
    this.unclampedFitness = this.ratioFitnessProperty.value;

  }

  /**
   * @private
   * @param fitness
   */
  setFitness( fitness ) {

    // If either value is small enough, then we don't allow an "in proportion" fitness level, so make it just below that threshold.
    if ( this.inProportion( fitness ) && this.valuesTooSmallForSuccess() ) {
      fitness = this.fitnessRange.max - this.getInProportionThreshold() - .01;
    }

    this.ratioFitnessProperty.value = Utils.clamp( fitness, this.fitnessRange.min, this.fitnessRange.max );
    console.log( this.ratioFitnessProperty.value );
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
    return Math.abs( this.leftVelocityProperty.value ) > VELOCITY_THRESHOLD && // right past threshold
           Math.abs( this.rightVelocityProperty.value ) > VELOCITY_THRESHOLD && // right past threshold
           ( this.leftVelocityProperty.value > 0 === this.rightVelocityProperty.value > 0 ); // both hands should be moving in the same direction
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
    velocityProperty.value = currentValue - previousValueProperty.value / this.valueRange.getLength();
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
    this.leftPositionProperty.reset();
    this.rightPositionProperty.reset();

    this.ratioProperty.reset();
    this.toleranceProperty.reset();
    this.leftValueProperty.reset();
    this.rightValueProperty.reset();
    this.firstInteractionProperty.reset();
    this.recalculateFitness();
  }
}

ratioAndProportion.register( 'RatioAndProportionModel', RatioAndProportionModel );
export default RatioAndProportionModel;