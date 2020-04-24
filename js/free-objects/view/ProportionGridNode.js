// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
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

    /**
     * @param {GridView} gridView
     */
    const getHorizontalLineSpacing = gridView => {
      return GridView.displayHorizontal( gridView ) ? height / gridViewProperties.gridBaseUnitProperty.value : null;
    };

    /**
     * @param {GridView} gridView
     */
    const getVerticalLineSpacing = gridView => {
      return GridView.displayVertical( gridView ) ? width / VERTICAL_SPACING : null;
    };

    super( width, height, {
      minorVerticalLineSpacing: getVerticalLineSpacing( gridViewProperties.gridViewProperty.value ),
      minorHorizontalLineSpacing: getHorizontalLineSpacing( gridViewProperties.gridViewProperty.value )
    } );

    Property.multilink( [ gridViewProperties.gridBaseUnitProperty, gridViewProperties.gridViewProperty ], ( baseUnit, gridView ) => {
      this.setLineSpacings( null, null, getVerticalLineSpacing( gridView ), getHorizontalLineSpacing( gridView ) );
    } );

    this.mutate( options );
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;