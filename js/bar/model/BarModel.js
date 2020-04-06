// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import ProportionModel from '../../common/model/ProportionModel.js';
import proportion from '../../proportion.js';

class BarModel extends ProportionModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const barRange = new Range( 0, 1 );

    const leftValueProperty = new NumberProperty( .2, {
      range: barRange,
      tandem: tandem.createTandem( 'leftBarProperty' )
    } );
    const rightValueProperty = new NumberProperty( .4, {
      range: barRange,
      tandem: tandem.createTandem( 'rightBarProperty' )
    } );

    super( leftValueProperty, rightValueProperty, tandem );
  }
}

proportion.register( 'BarModel', BarModel );
export default BarModel;