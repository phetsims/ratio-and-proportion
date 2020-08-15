// Copyright 2020, University of Colorado Boulder

/**
 * A combo box that displays the possible ranges for the grid lines and labels. The design requirements for this
 * component state that when disabled, that the elements aren't shown (as they are a distraction to the pedagogy. Instead
 * they are replaced with a solid horizontal line. To accomplish this, two ComboBoxes are created and then swapped out.
 * This ended up being easier and simpler than trying to add the ability to swap-out Nodes (and their PDOM content)
 * dynamically.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
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

class GridRangeComboBox extends Node {

  /**
   *
   * @param {Property.<number>} gridRangeProperty
   * @param {Node} comboBoxParent
   * @param {Property.<GridView>}gridViewProperty
   * @param {Object} [options]
   */
  constructor( gridRangeProperty, comboBoxParent, gridViewProperty, options ) {
    super();

    const items = [
      new ComboBoxItem( new RichText( ratioAndProportionStrings.zeroToTen, { font: GRID_RANGE_FONT } ), 10, {
        a11yLabel: ratioAndProportionStrings.zeroToTen
      } ),
      new ComboBoxItem( new RichText( ratioAndProportionStrings.zeroToTwenty, { font: GRID_RANGE_FONT } ), 20, {
        a11yLabel: ratioAndProportionStrings.zeroToTwenty
      } ),
      new ComboBoxItem( new RichText( ratioAndProportionStrings.zeroToThirty, { font: GRID_RANGE_FONT } ), 30, {
        a11yLabel: ratioAndProportionStrings.zeroToThirty
      } )
    ];

    const widestItem = Math.max( ...items.map( item => item.node.width ) );

    const comboBoxOptions = {
      labelNode: new RichText( ratioAndProportionStrings.range, { font: GRID_RANGE_FONT } ),
      helpText: ratioAndProportionStrings.a11y.create.gridRangeHelpText,
      accessibleName: ratioAndProportionStrings.range
    };

    const enabledComboBox = new ComboBox( items, gridRangeProperty, comboBoxParent, comboBoxOptions );

    const value = true;

    const disabledComboBox = new ComboBox( [
      new ComboBoxItem( new HSeparator( widestItem, { centerY: -5 } ), value, { a11yLabel: ratioAndProportionStrings.a11y.grid.disabled } ),
      items[ 0 ] // add this one to get the proper height of the text.
    ], new BooleanProperty( value ), new Node(), comboBoxOptions );

    // always disabled
    disabledComboBox.enabledProperty.value = false;

    // when not displaying the grid, show the "blank" line instead of the RichText.
    gridViewProperty.link( gridView => {
      this.children = gridView === GridView.NONE ? [ disabledComboBox ] : [ enabledComboBox ];
    } );
  }
}

ratioAndProportion.register( 'GridRangeComboBox', GridRangeComboBox );
export default GridRangeComboBox;