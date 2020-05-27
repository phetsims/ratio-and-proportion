// Copyright 2020, University of Colorado Boulder

/**
 * Labels for the ratio grid that are centered on the horizontal grid lines.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import designingProperties from '../../common/designingProperties.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import GridView from './GridView.js';

const LABEL_X = 0;

class RAPGridLabelsNode extends Node {

  /**
   * @param {Property.<GridView>} gridViewProperty
   * @param {number} height
   * @param {Object} [options]
   */
  constructor( gridViewProperty, height, options ) {

    if ( options ) {
      assert && assert( !options.hasOwnProperty( 'children' ), 'RAPGridLabelsNode sets its own children' );
    }

    super();

    // @private
    this.totalHeight = height;

    // @private {number|null}
    this.heightOfText = null;

    // @private
    this.gridViewProperty = gridViewProperty;

    this.mutate( options );

    Property.multilink( [ designingProperties.gridBaseUnitProperty, gridViewProperty ], this.update.bind( this ) );
  }

  /**
   * Get the height of a single label Text.
   * @public
   * @returns {number}
   *
   */
  get labelHeight() {
    assert && assert( this.heightOfText, 'cannot get labelHeight until labels have been drawn' );
    return this.heightOfText;
  }

  /**
   * @public
   */
  layout( height ) {

    this.totalHeight = height;
    this.update( designingProperties.gridBaseUnitProperty.value, this.gridViewProperty.value );
  }

  /**
   * @private
   */
  update( baseUnit, gridView ) {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    const horizontalSpacing = ( this.totalHeight - 1 ) / baseUnit;

    this.visible = GridView.displayUnits( gridView );

    this.updateUnitLabels( GridView.displayUnits( gridView ), horizontalSpacing );
  }

  /**
   * @private
   * @param {boolean} showGridUnits
   * @param {number} horizontalSpacing
   */
  updateUnitLabels( showGridUnits, horizontalSpacing ) {
    this.children = [];

    assert && assert( typeof horizontalSpacing === 'number', 'Unit Labels only supported for horizontal lines' );

    let i = 0;

    for ( let y = 0; y <= this.totalHeight; y += horizontalSpacing ) {
      const text = new Text( i, {
        centerX: LABEL_X,
        font: new PhetFont( 18 ),
        centerY: this.totalHeight - y
      } );
      this.heightOfText = text.height;

      this.addChild( text );
      i++;
    }
    assert && assert( this.heightOfText < horizontalSpacing, 'Text is too tall for the provided horizontal spacing' );
  }
}

ratioAndProportion.register( 'RAPGridLabelsNode', RAPGridLabelsNode );
export default RAPGridLabelsNode;