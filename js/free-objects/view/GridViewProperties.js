// Copyright 2020, University of Colorado Boulder

/**
 * Properties for controlling the display of the grid, see ProportionGridNode.js for details.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

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
  }

  // @public
  reset() {
    this.gridViewProperty.reset();
  }
}

ratioAndProportion.register( 'GridViewProperties', GridViewProperties );
export default GridViewProperties;