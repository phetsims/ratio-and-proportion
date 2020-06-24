// Copyright 2020, University of Colorado Boulder

/**
 * A combo box that displays the possible ranges for the grid lines and labels.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import GridView from '../../common/view/GridView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

const GRID_RANGE_FONT = new PhetFont( 16 );

class GridRangeComboBox extends ComboBox {

  /**
   *
   * @param {Property.<number>} gridBaseUnitProperty
   * @param {Node} comboBoxParent
   * @param {Property.<GridView>}gridViewProperty
   * @param {Object} [options]
   */
  constructor( gridBaseUnitProperty, comboBoxParent, gridViewProperty, options ) {
    super( [
      new GridRangeComboBoxItem( ratioAndProportionStrings.zeroToTen, 10, gridViewProperty ),
      new GridRangeComboBoxItem( ratioAndProportionStrings.zeroToTwenty, 20, gridViewProperty ),
      new GridRangeComboBoxItem( ratioAndProportionStrings.zeroToThirty, 30, gridViewProperty )
    ], gridBaseUnitProperty, comboBoxParent, {
      labelNode: new RichText( ratioAndProportionStrings.range, { font: GRID_RANGE_FONT } ),
      accessibleName: ratioAndProportionStrings.range
    } );
  }
}

// @private
class GridRangeComboBoxItem extends ComboBoxItem {

  /**
   * @param {string} label
   * @param {number} value
   * @param {Property.<GridView>} gridViewProperty
   */
  constructor( label, value, gridViewProperty ) {
    const text = new RichText( label, { font: GRID_RANGE_FONT } );
    console.log( text.height );
    const strut = new HSeparator( text.width, { centerY: -5 } );

    // when not displaying the grid, show the "blank" line instead of the RichText.
    gridViewProperty.link( gridView => {
      strut.visible = gridView === GridView.NONE;
      text.visible = gridView !== GridView.NONE;
    } );

    const content = new Node( { children: [ strut, text ] } );
    super( content, value, {
      a11yLabel: label
    } );
  }
}

ratioAndProportion.register( 'GridRangeComboBox', GridRangeComboBox );
export default GridRangeComboBox;