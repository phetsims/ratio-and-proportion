// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GridNode from '../../../../scenery-phet/js/GridNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class ProportionGridNode extends GridNode {

  /**
   * @param {GridViewProperties} gridViewProperties
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperties, width, height, options ) {

    super( width, height, null, null );

    gridViewProperties.gridBaseUnitProperty.link( baseUnit => {
      this.setMinorHorizontalLineSpacing( height / baseUnit );
    } );

    gridViewProperties.showVerticalGridLinesProperty.link( showVerticalGridLines => {
      this.setMinorVerticalLineSpacing( showVerticalGridLines ? width / 10 : null );
    } );

    this.mutate( options );
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;