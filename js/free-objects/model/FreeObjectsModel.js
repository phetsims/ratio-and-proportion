// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Color from '../../../../scenery/js/util/Color.js';
import ProportionModel from '../../common/model/ProportionModel.js';
import proportion from '../../proportion.js';
import MarkerDisplay from './MarkerDisplay.js';

class FreeObjectsModel extends ProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const leftPositionProperty = new Vector2Property( new Vector2( -.1, .2 ), {
      tandem: tandem.createTandem( 'leftBarProperty' )
    } );
    const rightPositionProperty = new Vector2Property( new Vector2( .1, .4 ), {
      tandem: tandem.createTandem( 'rightBarProperty' )
    } );

    const leftValueProperty = new DerivedProperty( [ leftPositionProperty ], value => value.y );
    const rightValueProperty = new DerivedProperty( [ rightPositionProperty ], value => value.y );

    super( leftValueProperty, rightValueProperty, tandem, {
      incorrectColor: new Color( 'white' ),
      resetValueProperties: false
    } );

    // @public - settable positions of the two values on the screen
    this.leftPositionProperty = leftPositionProperty;
    this.rightPositionProperty = rightPositionProperty;

    // @public {Property.<MarkerDisplay>}
    this.markerDisplayProperty = new EnumerationProperty( MarkerDisplay, MarkerDisplay.CIRCLE, {
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
    super.reset();
  }
}

proportion.register( 'FreeObjectsModel', FreeObjectsModel );
export default FreeObjectsModel;