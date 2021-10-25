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
import RAPModel from '../../common/model/RAPModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

class DiscoverScreenView extends RAPScreenView {

  private comboBoxContainer: ChallengeRatioComboBoxNode;

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   */
  constructor( model: RAPModel, tandem: Tandem ) {

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

    // @ts-ignore
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
   * @param {Bounds2} bounds
   */
  layout( bounds: Bounds2 ) {
    this.comboBoxContainer.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( bounds );
  }
}

ratioAndProportion.register( 'DiscoverScreenView', DiscoverScreenView );
export default DiscoverScreenView;