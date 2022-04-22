// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { Color, Node } from '../../../../scenery/js/imports.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeRatioComboBoxNode from './ChallengeRatioComboBoxNode.js';
import DiscoverScreenSummaryNode from './DiscoverScreenSummaryNode.js';
import RAPModel from '../../common/model/RAPModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkDescriber from '../../common/view/describers/TickMarkDescriber.js';

class DiscoverScreenView extends RAPScreenView {

  private comboBoxContainer: ChallengeRatioComboBoxNode;
  private discoverScreenSummaryNode: DiscoverScreenSummaryNode;
  resetDiscoverScreenView: () => void;

  constructor( model: RAPModel, backgroundColorProperty: Property<Color>, tandem: Tandem ) {

    // For this screen, one Property controls the color of both hands.
    const handColorProperty = new Property<Color>( Color.BLACK );

    super( model, backgroundColorProperty, {
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty,
      bothHandsPDOMNodeOptions: {
        gestureDescriptionHelpText: ratioAndProportionStrings.a11y.discover.bothHandsGestureDescriptionHelpText
      },
      tandem: tandem
    } );

    const comboBoxListBoxParent = new Node();

    this.comboBoxContainer = new ChallengeRatioComboBoxNode( model.targetRatioProperty, this.ratioDescriber,
      handColorProperty, comboBoxListBoxParent, tandem.createTandem( 'myChallengeComboBox' ) );

    this.topScalingUILayerNode.addChild( this.comboBoxContainer );

    // Should be on top. Don't scale it because that messes with the scaling that the list box goes through, and changes
    // the dimensions of the scalingUILayerNode to make it too big. Discovered in https://github.com/phetsims/ratio-and-proportion/issues/273
    this.addChild( comboBoxListBoxParent );

    this.pdomPlayAreaNode.pdomOrder = this.pdomPlayAreaNode.pdomOrder!.concat( [ this.comboBoxContainer, comboBoxListBoxParent ] );
    const handPositionsDescriber = new HandPositionsDescriber( model.ratio.tupleProperty,
      new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty ), model.inProportionProperty,
      model.ratio.enabledRatioTermsRangeProperty, model.ratio.lockedProperty );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.discoverScreenSummaryNode = new DiscoverScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.tupleProperty,
      model.targetRatioProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      model.inProportionProperty,
      handPositionsDescriber,
      this.comboBoxContainer.ratioToChallengeNameMap
    );
    this.setScreenSummaryContent( this.discoverScreenSummaryNode );

    // layout
    this.comboBoxContainer.right = this.tickMarkViewRadioButtonGroup.right;
    this.comboBoxContainer.top = this.tickMarkViewRadioButtonGroup.bottom + 20;

    this.resetDiscoverScreenView = () => {
      handPositionsDescriber.reset();
    };
  }

  override reset(): void {
    this.resetDiscoverScreenView();
    super.reset();
  }

  override layout( bounds: Bounds2 ): void {
    this.comboBoxContainer.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( bounds );
  }

  override getVoicingOverviewContent(): string {
    return ratioAndProportionStrings.a11y.discover.overviewSentence;
  }

  override getVoicingDetailsContent(): string {
    return this.discoverScreenSummaryNode.getDetailsButtonState();
  }

  override getVoicingHintContent(): string {
    return ratioAndProportionStrings.a11y.discover.screenSummary.interactionHint;
  }
}

ratioAndProportion.register( 'DiscoverScreenView', DiscoverScreenView );
export default DiscoverScreenView;