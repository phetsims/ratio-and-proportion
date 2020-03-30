// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import proportion from '../../proportion.js';

/**
 * @constructor
 */
class ProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const barRange = new Range( 0, 1 );

    this.leftBarValueProperty = new NumberProperty( .2, {
      range: barRange,
      tandem: tandem.createTandem( 'leftBarProperty' )
    } );
    this.rightBarValueProperty = new NumberProperty( 1, {
      range: barRange,
      tandem: tandem.createTandem( 'rightBarProperty' )
    } );
    this.colorProperty = new Property( 'red' );
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