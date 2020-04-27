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

    super( width, height );

    Property.multilink( [ gridViewProperties.gridBaseUnitProperty, gridViewProperties.gridViewProperty ], ( baseUnit, gridView ) => {
      const verticalSpacing = GridView.displayVertical( gridView ) ? width / VERTICAL_SPACING : null;
      const horizontalSpacing = GridView.displayHorizontal( gridView ) ? height / gridViewProperties.gridBaseUnitProperty.value : null;
      this.setLineSpacings( null, null, verticalSpacing, horizontalSpacing );
    } );

    this.mutate( options );
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;