// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Util from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Color from '../../../../scenery/js/util/Color.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import MarkerDisplay from './MarkerDisplay.js';

const CORRECT_COLOR = new Color( '#639a67' );
const INCORRECT_COLOR = new Color( 'white' );

class FreeObjectsModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the left value as compared to the right value. As in 1:2 (initial value).
    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( .05 );

    const modelBounds = new Bounds2( -.5, 0, .5, 1 );

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

    // @public - keep track of when either ratio half is focused or hovered.
    this.ratioHalvesFocusOrHoveredProperty = new BooleanProperty( false );

    // @public {Property.<MarkerDisplay>}
    this.markerDisplayProperty = new EnumerationProperty( MarkerDisplay, MarkerDisplay.HAND, {
      tandem: tandem.createTandem( 'markerDisplayProperty' )
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.leftPositionProperty.reset();
    this.rightPositionProperty.reset();
    this.markerDisplayProperty.reset();

    this.ratioProperty.reset();
    this.toleranceProperty.reset();
    this.leftValueProperty.reset();
    this.rightValueProperty.reset();
    this.firstInteractionProperty.reset();
  }
}

ratioAndProportion.register( 'FreeObjectsModel', FreeObjectsModel );
export default FreeObjectsModel;