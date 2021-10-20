// Copyright 2020, University of Colorado Boulder

/**
 * Labels for the ratio tick marks that are centered on the horizontal tick marks.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TickMarkView from './TickMarkView.js';

const LABEL_X = 0;

class RAPTickMarkLabelsNode extends Node {

  /**
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {number} height
   * @param {Property.<Color>} colorProperty
   * @param {Object} [options]
   */
  constructor( tickMarkViewProperty, tickMarkRangeProperty, height, colorProperty, options ) {

    if ( options ) {
      assert && assert( !options.hasOwnProperty( 'children' ), 'RAPTickMarkLabelsNode sets its own children' );
    }

    super();

    // @private
    this.totalHeight = height;

    // @private {number|null}
    this.heightOfText = null;

    // @private
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.colorProperty = colorProperty;

    this.mutate( options );

    Property.multilink( [ tickMarkRangeProperty, tickMarkViewProperty ], this.update.bind( this ) );
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
    this.update( this.tickMarkRangeProperty.value, this.tickMarkViewProperty.value );
  }

  /**
   * @private
   */
  update( tickMarkRange, tickMarkView ) {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    const horizontalSpacing = ( this.totalHeight - 1 ) / tickMarkRange;

    this.visible = tickMarkView === TickMarkView.VISIBLE_WITH_UNITS;

    this.updateUnitLabels( tickMarkView === TickMarkView.VISIBLE_WITH_UNITS, horizontalSpacing );
  }

  /**
   * @private
   * @param {boolean} showTickMarkUnits
   * @param {number} horizontalSpacing
   */
  updateUnitLabels( showTickMarkUnits, horizontalSpacing ) {
    this.children = [];

    assert && assert( typeof horizontalSpacing === 'number', 'Unit Labels only supported for horizontal lines' );

    let i = 0;

    for ( let y = 0; y <= this.totalHeight; y += horizontalSpacing ) {
      const text = new Text( i, {
        centerX: LABEL_X,
        font: new PhetFont( { size: 18, weight: 'bold' } ),
        fill: this.colorProperty,
        centerY: this.totalHeight - y
      } );
      this.heightOfText = text.height;

      this.addChild( text );
      i++;
    }
  }
}

ratioAndProportion.register( 'RAPTickMarkLabelsNode', RAPTickMarkLabelsNode );
export default RAPTickMarkLabelsNode;