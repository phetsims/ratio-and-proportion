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
import ProportionConstants from '../ProportionConstants.js';

// The threshold for velocity of a moving ratio value to indivate that it is "moving."
const VELOCITY_THRESHOLD = .01;

class RatioAndProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( RatioAndProportionQueryParameters.tolerance );

    // @public
    this.valueRange = new Range( .0001, 1 ); // Do avoid devide-by zero errors

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

    // @public (read-only) - the Range that the proportionFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @public (read-only) - the velocity of each value changing, adjusted in step
    this.leftVelocityProperty = new NumberProperty( 0 );
    this.rightVelocityProperty = new NumberProperty( 0 );

    // TODO: rename to have ratio in it?
    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Can be between 0 and 1, if 1, the proportion of the two values is
    // exactly the value of the ratioProperty. If zero, it is outside the tolerance allowed for the proportion.
    this.proportionFitnessProperty = new DerivedProperty( [
      this.leftValueProperty,
      this.rightValueProperty,
      this.ratioProperty,
      this.toleranceProperty
    ], ( leftValue, rightValue, ratio, tolerance ) => {
      const currentRatio = leftValue / rightValue;
      assert && assert( rightValue !== 0, 'cannot divide by zero' );
      if ( isNaN( currentRatio ) ) {
        return 0;
      }
      if ( leftValue < .05 || rightValue < .05 ) {
        return 0;
      }
      const desiredLeft = ratio * rightValue;
      const fitnessError = Math.abs( desiredLeft - leftValue );
      return 1 - Utils.clamp( fitnessError / tolerance, 0, 1 );
    }, {
      isValidValue: value => this.fitnessRange.contains( value )
    } );

    // @public - true before and until first user interaction with the simulation. Reset will apply to this Property.
    this.firstInteractionProperty = new BooleanProperty( true );

    // @private
    this.previousLeftValueProperty = new NumberProperty( this.leftValueProperty.value );
    this.previousRightValueProperty = new NumberProperty( this.rightValueProperty.value );
    this.stepCountTracker = 0;
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
    let threshold = ProportionConstants.IN_PROPORTION_FITNESS_THRESHOLD;
    if ( this.movingInDirection() ) {
      threshold = ProportionConstants.MOVING_IN_PROPORTION_FITNESS_THRESHOLD;
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
  inProportion( fitness = this.proportionFitnessProperty.value ) {
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
  }
}

ratioAndProportion.register( 'RatioAndProportionModel', RatioAndProportionModel );
export default RatioAndProportionModel;