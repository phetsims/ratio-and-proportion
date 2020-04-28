// Copyright 2020, University of Colorado Boulder

/**
 * Properties for controlling the display of the grid, see ProportionGridNode.js for details.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';

class GridViewProperties {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public - what display for the grid to be viewed. Horizontal, horizontal and vertical, none.
    this.gridViewProperty = new EnumerationProperty( GridView, GridView.HORIZONTAL, {
      tandem: tandem.createTandem( 'gridViewProperty' )
    } );

    // @public is the equilibrium position visible?
    this.showGridUnitsProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showGridUnitsProperty' )
    } );
  }

  // @public
  reset() {
    this.gridViewProperty.reset();
    this.showGridUnitsProperty.reset();
  }
}

ratioAndProportion.register( 'GridViewProperties', GridViewProperties );
export default GridViewProperties;