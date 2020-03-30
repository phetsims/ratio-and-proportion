// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Util from '../../../../dot/js/Utils.js';
import Color from '../../../../scenery/js/util/Color.js';
import proportion from '../../proportion.js';

// constants
const INCORRECT_COLOR = new Color( 'red' );
const CORRECT_COLOR = new Color( 'green' );

/**
 * @constructor
 */
class ProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const barRange = new Range( 0, 1 );

    this.ratioProperty = new NumberProperty( .5 );
    this.toleranceProperty = new NumberProperty( .05 );

    this.leftBarValueProperty = new NumberProperty( .2, {
      range: barRange,
      tandem: tandem.createTandem( 'leftBarProperty' )
    } );
    this.rightBarValueProperty = new NumberProperty( 1, {
      range: barRange,
      tandem: tandem.createTandem( 'rightBarProperty' )
    } );

    this.colorProperty = new Property( this.colorGradient );

    this.firstInteractionProperty = new BooleanProperty( true );

    Property.multilink( [ this.ratioProperty, this.toleranceProperty, this.leftBarValueProperty, this.rightBarValueProperty ], () => {

      const currentRatio = this.leftBarValueProperty.value / this.rightBarValueProperty.value;
      const ratioError = currentRatio - this.ratioProperty.value;
      const normalizedError = Util.clamp( Math.abs( ratioError ) / this.toleranceProperty.value, 0, 1 );
      this.colorProperty.value = Color.interpolateRGBA( CORRECT_COLOR, INCORRECT_COLOR, normalizedError );
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.leftBarValueProperty.reset();
    this.rightBarValueProperty.reset();
    this.colorProperty.reset();
  }

}

proportion.register( 'ProportionModel', ProportionModel );
export default ProportionModel;