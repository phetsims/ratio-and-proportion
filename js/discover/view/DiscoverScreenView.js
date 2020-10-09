// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ChallengeRatioComboBoxNode from './ChallengeRatioComboBoxNode.js';
import DiscoverScreenSummaryNode from './DiscoverScreenSummaryNode.js';


class DiscoverScreenView extends RAPScreenView {

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    const comboBoxContainer = new ChallengeRatioComboBoxNode( model.targetRatioProperty, this.ratioDescriber );

    this.topScalingUILayerNode.addChild( comboBoxContainer );

    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [ comboBoxContainer ] );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new DiscoverScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.numeratorProperty,
      model.ratio.denominatorProperty,
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