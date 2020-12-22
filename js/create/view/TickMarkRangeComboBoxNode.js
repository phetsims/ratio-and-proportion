// Copyright 2020, University of Colorado Boulder

/**
 * A combo box that displays the possible ranges for the tick marks and labels. The design requirements for this
 * component state that when disabled, that the elements aren't shown (as they are a distraction to the pedagogy).
 * Instead they are replaced with a solid horizontal line. To accomplish this, two ComboBoxes are created and then
 * swapped out. This ended up being easier and simpler than trying to add the ability to swap-out Nodes (and their PDOM
 * content) dynamically to a single ComboBox instance.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

const TICK_MARK_RANGE_FONT = new PhetFont( 16 );
const RANGE_TEXT_OPTIONS = { font: TICK_MARK_RANGE_FONT };

class TickMarkRangeComboBoxNode extends Node {

  /**
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {Node} comboBoxParent
   * @param {Property.<TickMarkView>}tickMarkViewProperty
   * @param {Object} [options]
   */
  constructor( tickMarkRangeProperty, comboBoxParent, tickMarkViewProperty, options ) {
    super();

    const tickMarkRangeMap = {
      10: ratioAndProportionStrings.zeroToTen,
      20: ratioAndProportionStrings.zeroToTwenty,
      30: ratioAndProportionStrings.zeroToThirty
    };

    const items = [
      new ComboBoxItem( new RichText( tickMarkRangeMap[ 10 ], RANGE_TEXT_OPTIONS ), 10, {
        a11yLabel: ratioAndProportionStrings.zeroToTen
      } ),
      new ComboBoxItem( new RichText( tickMarkRangeMap[ 20 ], RANGE_TEXT_OPTIONS ), 20, {
        a11yLabel: ratioAndProportionStrings.zeroToTwenty
      } ),
      new ComboBoxItem( new RichText( tickMarkRangeMap[ 30 ], RANGE_TEXT_OPTIONS ), 30, {
        a11yLabel: ratioAndProportionStrings.zeroToThirty
      } )
    ];

    const widestItem = Math.max( ...items.map( item => item.node.width ) );

    const comboBoxOptions = {
      labelNode: new RichText( ratioAndProportionStrings.range, RANGE_TEXT_OPTIONS ),
      helpText: ratioAndProportionStrings.a11y.create.tickMarkRangeHelpText,
      accessibleName: ratioAndProportionStrings.range,
      maxWidth: 300 // empirically determined
    };

    // @private
    this.enabledComboBox = new ComboBox( items, tickMarkRangeProperty, comboBoxParent, comboBoxOptions );

    const value = true;

    // @private
    this.disabledComboBox = new ComboBox( [
      new ComboBoxItem( new HSeparator( widestItem, { centerY: -5 } ), value, { a11yLabel: ratioAndProportionStrings.a11y.tickMark.tickMarksHidden } ),
      items[ 0 ] // add this one to get the proper height of the text.
    ], new BooleanProperty( value ), new Node(), comboBoxOptions );

    // always disabled
    this.disabledComboBox.enabledProperty.value = false;

    // when not displaying the tick marks, show the "blank" line instead of the RichText.
    tickMarkViewProperty.link( tickMarkView => {
      this.children = tickMarkView === TickMarkView.NONE ? [ this.disabledComboBox ] : [ this.enabledComboBox ];
    } );

    const tickMarkRangeChangedUtterance = new ActivationUtterance();

    tickMarkRangeProperty.lazyLink( range => {
      tickMarkRangeChangedUtterance.alert = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.tickMarkRangeContextResponse, {
        range: tickMarkRangeMap[ range ]
      } );
      phet.joist.sim.utteranceQueue.addToBack( tickMarkRangeChangedUtterance );
    } );
  }

  /**
   * @public
   */
  hideListBox() {
    this.enabledComboBox.hideListBox();
    this.disabledComboBox.hideListBox();
  }
}

ratioAndProportion.register( 'TickMarkRangeComboBoxNode', TickMarkRangeComboBoxNode );
export default TickMarkRangeComboBoxNode;