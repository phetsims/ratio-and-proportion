// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../scenery-phet/js/GridNode.js';
import designingProperties from '../../common/designingProperties.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';

class RatioHalfGridNode extends GridNode {

  /**
   * @param {Property.<GridView>} gridViewProperty
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperty, width, height, options ) {

    super( width, height );

    // @private
    this.gridViewProperty = gridViewProperty;

    // TODO: is this line actually necessary?
    // support lines to begin with. This handles the case where the GridNode initialized to having no line.
    this.setLineSpacings( null, null, 10, 10 );
    this.mutate( options );

    Property.multilink( [ designingProperties.gridBaseUnitProperty, gridViewProperty ], this.update.bind( this ) );
  }

  /**
   * @public
   */
  layout( width, height ) {
    this.setGridWidth( width );
    this.setGridHeight( height );
    this.update( designingProperties.gridBaseUnitProperty.value, this.gridViewProperty.value );
  }

  /**
   * @private
   */
  update( baseUnit, gridView ) {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    this.setLineSpacings( null, null, null, ( this.gridHeight - 1 ) / baseUnit );

    this.visible = GridView.displayVertical( gridView ) || GridView.displayHorizontal( gridView );
  }
}

ratioAndProportion.register( 'RatioHalfGridNode', RatioHalfGridNode );
export default RatioHalfGridNode;