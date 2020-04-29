// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific grid implementation with that supports customization through passed in Properties.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../scenery-phet/js/GridNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';
import designingProperties from '../../common/designingProperties.js';

const VERTICAL_SPACING = 10;
const LABEL_X = 0;

class ProportionGridNode extends GridNode {

  /**
   * @param {GridViewProperties} gridViewProperties
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperties, width, height, options ) {

    super( width, height );

    // @private
    this.labelsNode = new Node();
    this.addChild( this.labelsNode );

    // support lines to begin with. This handles the case where the GridNode initialized to having no line.
    this.setLineSpacings( null, null, 10, 10 );
    this.mutate( options );

    Property.multilink( [
      designingProperties.gridBaseUnitProperty,
      gridViewProperties.gridViewProperty
    ], ( baseUnit, gridView ) => {
      const verticalSpacing = GridView.displayVertical( gridView ) ? width / VERTICAL_SPACING : null;
      const horizontalSpacing = GridView.displayHorizontal( gridView ) ? height / baseUnit : null;

      this.setLineSpacings( null, null, verticalSpacing, horizontalSpacing );

      this.updateUnitLabels( GridView.displayUnits( gridView ), horizontalSpacing );
    } );

  }

  /**
   * @private
   * @param {boolean} showGridUnits
   * @param {number} horizontalSpacing
   */
  updateUnitLabels( showGridUnits, horizontalSpacing ) {
    this.labelsNode.children = [];

    if ( showGridUnits ) {
      assert && assert( typeof horizontalSpacing === 'number', 'Unit Labels only supported for horizontal lines' );

      let i = 0;

      // use "5" to ensure that we don't get a unit on the top number, even with weird rounding.
      for ( let y = 0; y < this.height - 5; y += horizontalSpacing ) {
        this.labelsNode.addChild( new Text( i, {
          bottom: this.height - y,
          left: LABEL_X,
          font: new PhetFont( 13 )
        } ) );
        i++;
      }
      assert && assert( this.labelsNode.children[ 0 ].height < horizontalSpacing, 'Text is too tall for the provided horizontal spacing' );
    }
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;