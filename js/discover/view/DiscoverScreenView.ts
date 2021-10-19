// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeRatioComboBoxNode from './ChallengeRatioComboBoxNode.js';
import DiscoverScreenSummaryNode from './DiscoverScreenSummaryNode.js';

class DiscoverScreenView extends RAPScreenView {

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // For this screen, one Property controls the color of both hands.
    const handColorProperty = new Property( 'black' );

    super( model, tandem, {
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty,
      bothHandsPDOMNodeOptions: {
        gestureDescriptionHelpText: ratioAndProportionStrings.a11y.discover.bothHandsGestureDescriptionHelpText
      }
    } );

    const comboBoxListBoxParent = new Node();

    // @private
    this.comboBoxContainer = new ChallengeRatioComboBoxNode( model.targetRatioProperty, this.ratioDescriber,
      handColorProperty, comboBoxListBoxParent, tandem.createTandem( 'myChallengeComboBox' ) );

    this.topScalingUILayerNode.addChild( this.comboBoxContainer );

    // Should be on top. Don't scale it because that messes with the scaling that the list box goes through, and changes
    // the dimensions of the scalingUILayerNode to make it too big. Discovered in https://github.com/phetsims/ratio-and-proportion/issues/273
    this.addChild( comboBoxListBoxParent );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder.concat( [ this.comboBoxContainer, comboBoxListBoxParent ] );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new DiscoverScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.tupleProperty,
      model.targetRatioProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      this.comboBoxContainer.ratioToChallengeNameMap
    ) );

    // layout
    this.comboBoxContainer.right = this.tickMarkViewRadioButtonGroup.right;
    this.comboBoxContainer.top = this.tickMarkViewRadioButtonGroup.bottom + 20;
  }

  /**
   * @override
   * @public
   * @param {number} width
   * @param {number} height
   */
  layout( width, height ) {
    this.comboBoxContainer.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( width, height );
  }
}

ratioAndProportion.register( 'DiscoverScreenView', DiscoverScreenView );
export default DiscoverScreenView;