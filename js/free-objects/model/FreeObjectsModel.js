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
import Util from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Color from '../../../../scenery/js/util/Color.js';
import RatioAndProportionQueryParameters from '../../common/RatioAndProportionQueryParameters.js';
import ratioAndProportion from '../../ratioAndProportion.js';

const CORRECT_COLOR = new Color( '#639a67' );
const INCORRECT_COLOR = new Color( 'white' );

class FreeObjectsModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( RatioAndProportionQueryParameters.tolerance );

    // @public
    this.valueRange = new Range( 0, 1 );

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
      if ( isNaN( currentRatio ) ) {
        return 0;
      }
      const ratioError = currentRatio - ratio;
      return 1 - Util.clamp( Math.abs( ratioError ) / tolerance, 0, 1 );
    }, {
      isValidValue: value => this.fitnessRange.contains( value )
    } );

    // @public - based on the proportion fitness
    this.colorProperty = new DerivedProperty( [ this.proportionFitnessProperty ], fitness => {
      return Color.interpolateRGBA( INCORRECT_COLOR, CORRECT_COLOR, fitness );
    }, { valueType: Color } );

    // @public - true before and until first user interaction with the simulation. Reset will apply to this Property.
    this.firstInteractionProperty = new BooleanProperty( true );

    // @public (read-only) - the velocity of each value changing, adjusted in step
    this.leftVelocityProperty = new NumberProperty( 0 );
    this.rightVelocityProperty = new NumberProperty( 0 );

    // @private
    this.previousLeftValueProperty = new NumberProperty( this.leftValueProperty.value );
    this.previousRightValueProperty = new NumberProperty( this.rightValueProperty.value );
    this.stepCountTracker = 0;
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

ratioAndProportion.register( 'FreeObjectsModel', FreeObjectsModel );
export default FreeObjectsModel;