// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GridNode from '../../../../scenery-phet/js/GridNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';

const VERTICAL_SPACING = 10;

class ProportionGridNode extends GridNode {

  /**
   * @param {GridViewProperties} gridViewProperties
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperties, width, height, options ) {

    super( width, height, null, null );

    // @private
    this.gridViewProperties = gridViewProperties;

    gridViewProperties.gridBaseUnitProperty.link( () => {
      this.updateHorizontalLines( gridViewProperties.gridViewProperty.value );
      this.updateUnitLabels();
    } );

    gridViewProperties.gridViewProperty.link( gridView => {
      this.updateHorizontalLines( gridView );
      this.updateVerticalLines( gridView );
    } );

    gridViewProperties.showGridUnitsProperty.link( () => {
      this.updateUnitLabels();
    } );

    this.mutate( options );
  }

  /**
   * @private
   */
  updateUnitLabels() {

  }

  /**
   * @private
   * @param {GridView} gridView
   */
  updateHorizontalLines( gridView ) {
    const lineSpacing = GridView.displayHorizontal( gridView ) ? this.gridHeight / this.gridViewProperties.gridBaseUnitProperty.value : null;
    this.setMinorHorizontalLineSpacing( lineSpacing );
  }

  /**
   * @private
   * @param {GridView} gridView
   */
  updateVerticalLines( gridView ) {
    const lineSpacing = GridView.displayVertical( gridView ) ? this.gridWidth / VERTICAL_SPACING : null;
    this.setMinorVerticalLineSpacing( lineSpacing );
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;