// Copyright 2020-2022, University of Colorado Boulder

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
import { Node, RichText } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import HSeparator from '../../../../sun/js/HSeparator.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';

const TICK_MARK_RANGE_FONT = new PhetFont( 16 );
const RANGE_TEXT_OPTIONS = { font: TICK_MARK_RANGE_FONT };

class TickMarkRangeComboBoxNode extends Node {

  private enabledComboBox: ComboBox<number>;
  private disabledComboBox: ComboBox<true | number>;
  private tickMarkRangeMap: Record<number, string>;
  private tickMarkRangeProperty: Property<number>

  constructor( tickMarkRangeProperty: Property<number>, comboBoxParent: Node,
               tickMarkViewProperty: EnumerationProperty<TickMarkView> ) {
    super();

    this.tickMarkRangeMap = {
      10: ratioAndProportionStrings.zeroToTen,
      20: ratioAndProportionStrings.zeroToTwenty,
      30: ratioAndProportionStrings.zeroToThirty
    };
    this.tickMarkRangeProperty = tickMarkRangeProperty;

    const items = [
      new ComboBoxItem( new RichText( this.tickMarkRangeMap[ 10 ], RANGE_TEXT_OPTIONS ), 10, {
        a11yLabel: ratioAndProportionStrings.zeroToTen
      } ),
      new ComboBoxItem( new RichText( this.tickMarkRangeMap[ 20 ], RANGE_TEXT_OPTIONS ), 20, {
        a11yLabel: ratioAndProportionStrings.zeroToTwenty
      } ),
      new ComboBoxItem( new RichText( this.tickMarkRangeMap[ 30 ], RANGE_TEXT_OPTIONS ), 30, {
        a11yLabel: ratioAndProportionStrings.zeroToThirty
      } )
    ];

    const widestItem = Math.max( ...items.map( item => item.node.width ) );

    const comboBoxOptions = {
      labelNode: new RichText( ratioAndProportionStrings.range, RANGE_TEXT_OPTIONS ),
      helpText: ratioAndProportionStrings.a11y.create.tickMarkRangeHelpText,
      accessibleName: ratioAndProportionStrings.range,
      maxWidth: 300, // empirically determined

      comboBoxVoicingNameResponsePattern: ratioAndProportionStrings.a11y.create.rangeLabelPattern,
      comboBoxVoicingContextResponse: () => this.getContextResponse(),
      comboBoxVoicingHintResponse: ratioAndProportionStrings.a11y.create.tickMarkRangeHelpText,

      // phet-io
      tandem: Tandem.OPT_OUT
    };

    this.enabledComboBox = new ComboBox( items, tickMarkRangeProperty, comboBoxParent, comboBoxOptions );

    const value = true;

    // NOTE: The values are [ 10, true ]... so it's typed interestingly.
    this.disabledComboBox = new ComboBox<true | number>( [
      new ComboBoxItem( new HSeparator( widestItem, { centerY: -5 } ), value, { a11yLabel: ratioAndProportionStrings.a11y.tickMark.tickMarksHidden } ),
      items[ 0 ] // add this one to get the proper height of the text.
    ], new BooleanProperty( value ) as Property<true | number>, new Node(), comboBoxOptions );

    // always disabled
    this.disabledComboBox.enabledProperty.value = false;

    // when not displaying the tick marks, show the "blank" line instead of the RichText.
    tickMarkViewProperty.link( tickMarkView => {
      this.children = tickMarkView === TickMarkView.NONE ? [ this.disabledComboBox ] : [ this.enabledComboBox ];
    } );

    const tickMarkRangeChangedUtterance = new ActivationUtterance();

    tickMarkRangeProperty.lazyLink( () => {
      tickMarkRangeChangedUtterance.alert = this.getContextResponse();
      this.alertDescriptionUtterance( tickMarkRangeChangedUtterance );
    } );
  }

  private getContextResponse(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.create.tickMarkRangeContextResponse, {
      range: this.tickMarkRangeMap[ this.tickMarkRangeProperty.value ]
    } );
  }

  hideListBox(): void {
    this.enabledComboBox.hideListBox();
    this.disabledComboBox.hideListBox();
  }
}

ratioAndProportion.register( 'TickMarkRangeComboBoxNode', TickMarkRangeComboBoxNode );
export default TickMarkRangeComboBoxNode;