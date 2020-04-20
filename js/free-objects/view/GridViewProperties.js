// Copyright 2020, University of Colorado Boulder

/**
 * Properties for controlling the display of the grid, see ProportionGridNode.js for details.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import proportion from '../../proportion.js';

class GridViewProperties {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public is the applied force vector visible?
    this.showVerticalGridLinesProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showVerticalGridLinesProperty' )
    } );

    // @public what is the unit value of the grid. Value reads as "1/x of the view height"
    this.gridBaseUnitProperty = new NumberProperty( 10, {
      tandem: tandem.createTandem( 'gridBaseUnitProperty' )
    } );

    // @public is the equilibrium position visible?
    this.showGridUnitsProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showGridUnitsProperty' )
    } );
  }

  // @public
  reset() {
    this.showVerticalGridLinesProperty.reset();
    this.gridBaseUnitProperty.reset();
    this.showGridUnitsProperty.reset();
  }
}

proportion.register( 'GridViewProperties', GridViewProperties );
export default GridViewProperties;