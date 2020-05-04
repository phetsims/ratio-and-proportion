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

    // @private
    this.gridViewProperty = gridViewProperties.gridViewProperty;

    // support lines to begin with. This handles the case where the GridNode initialized to having no line.
    this.setLineSpacings( null, null, 10, 10 );
    this.mutate( options );

    Property.multilink( [ designingProperties.gridBaseUnitProperty, gridViewProperties.gridViewProperty ], this.update.bind( this ) );
  }

  /**
   * @public
   */
  layout( width, height ) {
    this.setGridWidth( width );
    this.setGridHeight( height );
    this.update( designingProperties.gridBaseUnitProperty.value, this.gridViewProperty.value );
  }

  update( baseUnit, gridView ) {
    const verticalSpacing = this.gridWidth / VERTICAL_SPACING;
    const horizontalSpacing = this.gridHeight / baseUnit; // TODO: probably should try to keep this consistent across different screenView heights
    this.setLineSpacings( null, null, verticalSpacing, horizontalSpacing );

    this.visible = GridView.displayVertical( gridView ) || GridView.displayHorizontal( gridView );

    this.updateUnitLabels( GridView.displayUnits( gridView ), horizontalSpacing );
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

      for ( let y = 0; y <= this.gridHeight; y += horizontalSpacing ) {
        const text = new Text( i, {
          left: LABEL_X,
          font: new PhetFont( 13 )
        } );

        // put the top/last number underneath
        if ( y === this.gridHeight ) {
          text.top = 0;
        }
        else {
          text.bottom = this.gridHeight - y;
        }

        this.labelsNode.addChild( text );
        i++;
      }
      assert && assert( this.labelsNode.children[ 0 ].height < horizontalSpacing, 'Text is too tall for the provided horizontal spacing' );
    }
  }
}

ratioAndProportion.register( 'ProportionGridNode', ProportionGridNode );
export default ProportionGridNode;