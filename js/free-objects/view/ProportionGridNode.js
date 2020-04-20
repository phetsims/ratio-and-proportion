// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann
 */

import GridNode from '../../../../scenery-phet/js/GridNode.js';
import proportion from '../../proportion.js';

class ProportionGridNode extends GridNode {

  /**
   * @param {GridViewProperties} gridViewProperties
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperties, width, height, options ) {

    super( width, height, null, null, options );

    gridViewProperties.gridBaseUnitProperty.link( baseUnit => {
      this.setMinorHorizontalLineSpacing( height / baseUnit );
    } );

    gridViewProperties.showVerticalGridLinesProperty.link( showVerticalGridLines => {
      this.setMinorVerticalLineSpacing( showVerticalGridLines ? width / 10 : null );
    } );
  }
}

proportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;