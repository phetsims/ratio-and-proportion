// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties. This uses minor lines
 * from GridNode, but not major lines.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import merge from '../../../../phet-core/js/merge.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';

class RatioHalfGridNode extends GridNode {

  /**
   * @param {Property.<GridView>} gridViewProperty
   * @param {Property.<number>} gridBaseUnitProperty
   * @param {number} width
   * @param {number} height
   * @param {Property.<Color>} colorProperty
   * @param {Object} [options]
   */
  constructor( gridViewProperty, gridBaseUnitProperty, width, height, colorProperty, options ) {

    options = merge( {
      minorLineOptions: {
        stroke: colorProperty
      }
    }, options );

    super( width, height, options );

    // @private
    this.gridViewProperty = gridViewProperty;
    this.gridBaseUnitProperty = gridBaseUnitProperty;

    // TODO: is this line actually necessary?
    // support lines to begin with. This handles the case where the GridNode initialized to having no line.
    this.setLineSpacings( null, null, 10, 10 );

    Property.multilink( [ gridBaseUnitProperty, gridViewProperty ], this.update.bind( this ) );
  }

  /**
   * @public
   */
  layout( width, height ) {
    this.setGridWidth( width );
    this.setGridHeight( height );
    this.update( this.gridBaseUnitProperty.value, this.gridViewProperty.value );
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