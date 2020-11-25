// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
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

    const comboBoxContainer = new ChallengeRatioComboBoxNode( model.targetRatioProperty, this.ratioDescriber, handColorProperty );

    this.topScalingUILayerNode.addChild( comboBoxContainer );

    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [ comboBoxContainer ] );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new DiscoverScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.antecedentProperty,
      model.ratio.consequentProperty,
      model.targetRatioProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      comboBoxContainer.ratioToChallengeNameMap
    ) );

    // layout
    comboBoxContainer.left = this.tickMarkViewRadioButtonGroup.left;
    comboBoxContainer.top = this.tickMarkViewRadioButtonGroup.bottom + 20;
  }
}

ratioAndProportion.register( 'DiscoverScreenView', DiscoverScreenView );
export default DiscoverScreenView;