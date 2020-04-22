// Copyright 2020, University of Colorado Boulder

/**
 * Properties for controlling the display of the grid, see ProportionGridNode.js for details.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
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

    // @public what is the unit value of the grid. Value reads as "1/x of the view height." This does not effect vertical
    // grid lines.
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

ratioAndProportion.register( 'GridViewProperties', GridViewProperties );
export default GridViewProperties;