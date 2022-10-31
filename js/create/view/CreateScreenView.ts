// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { Color, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import LockNode from '../../../../scenery-phet/js/LockNode.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RAPColors from '../../common/view/RAPColors.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import CreateScreenSummaryNode from './CreateScreenSummaryNode.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import TickMarkRangeComboBoxNode from './TickMarkRangeComboBoxNode.js';
import RAPModel from '../../common/model/RAPModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkDescriber from '../../common/view/describers/TickMarkDescriber.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { SpeakableResolvedResponse } from '../../../../utterance-queue/js/ResponsePacket.js';


class CreateScreenView extends RAPScreenView {

  private tickMarkRangeComboBoxNode: TickMarkRangeComboBoxNode;
  private resetCreateScreenView: () => void;

  // set this after the supertype has initialized the view code needed to create the screen summary
  private createScreenSummaryNode: CreateScreenSummaryNode;

  public constructor( model: RAPModel, backgroundColorProperty: Property<Color>, tandem: Tandem ) {

    // For this screen, one Property controls the color of both hands.
    const handColorProperty = RAPColors.createScreenHandProperty;

    super( model, backgroundColorProperty, {
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty,
      bothHandsPDOMNodeOptions: {
        gestureDescriptionHelpText: RatioAndProportionStrings.a11y.create.bothHandsGestureDescriptionHelpTextStringProperty
      },
      tandem: tandem
    } );

    const myChallengeAccordionBox = new MyChallengeAccordionBox( model.targetRatioProperty, model.ratio.lockedProperty, handColorProperty,
      this.tickMarkViewProperty, this.ratioDescriber, { tandem: tandem.createTandem( 'myChallengeAccordionBox' ) } );

    const tickMarkRangeComboBoxParent = new Node();

    this.tickMarkRangeComboBoxNode = new TickMarkRangeComboBoxNode( this.tickMarkRangeProperty,
      tickMarkRangeComboBoxParent, this.tickMarkViewProperty, {
        layoutOptions: {
          topMargin: -10,
          bottomMargin: 10
        }
      } );

    const handPositionsDescriber = new HandPositionsDescriber( model.ratio.tupleProperty,
      new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty ),
      model.inProportionProperty, model.ratio.enabledRatioTermsRangeProperty, model.ratio.lockedProperty );

    this.createScreenSummaryNode = new CreateScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.tupleProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      model.inProportionProperty,
      handPositionsDescriber,
      this.tickMarkRangeProperty,
      myChallengeAccordionBox
    );
    this.setScreenSummaryContent( this.createScreenSummaryNode );

    const ratioLockContent = new HBox( {
      spacing: 8,
      maxWidth: 200,
      children: [
        new Text( RatioAndProportionStrings.ratioLockStringProperty, { font: new PhetFont( 20 ) } ),
        new LockNode( model.ratio.lockedProperty, { scale: 0.5 } )
      ]
    } );

    const ratioLockCheckbox = new Checkbox( model.ratio.lockedProperty, ratioLockContent, {
      accessibleName: RatioAndProportionStrings.ratioLockStringProperty,
      voicingNameResponse: RatioAndProportionStrings.ratioLockStringProperty,

      checkedContextResponse: RatioAndProportionStrings.a11y.ratioLockCheckboxContextResponseStringProperty,
      uncheckedContextResponse: RatioAndProportionStrings.a11y.ratioNoLongerLockedStringProperty,

      // phet-io
      tandem: tandem.createTandem( 'ratioLockCheckbox' )
    } );

    ratioLockCheckbox.enabledProperty.link( ( enabled: boolean ) => {

      ratioLockCheckbox.helpText = enabled ? RatioAndProportionStrings.a11y.ratioLockEnabledHelpTextStringProperty :
                                   RatioAndProportionStrings.a11y.ratioLockDisabledHelpTextStringProperty;
      ratioLockCheckbox.voicingHintResponse = enabled ? RatioAndProportionStrings.a11y.ratioLockEnabledHelpTextStringProperty :
                                              RatioAndProportionStrings.a11y.ratioLockDisabledHelpTextStringProperty;
    } );

    ratioLockCheckbox.touchArea = ratioLockCheckbox.localBounds.dilatedXY( 8, 0.5 * ratioLockCheckbox.height );
    ratioLockCheckbox.mouseArea = ratioLockCheckbox.localBounds.dilatedXY( 8, 0.5 * ratioLockCheckbox.height );

    // The "lock ratio" checkbox should not be enabled when the ratio is not in proportion.
    Multilink.multilink( [
      model.inProportionProperty,
      model.ratioFitnessProperty
    ], inProportion => {
      ratioLockCheckbox.enabledProperty.value = inProportion;

      // If the checkbox gets disabled, then unlock the ratio.
      if ( !ratioLockCheckbox.enabledProperty.value ) {
        model.ratio.lockedProperty.value = false;
      }
    } );

    // children - remember to not blow away children set by parent
    this.topScalingUILayerNode.addChild( this.tickMarkRangeComboBoxNode );
    this.topScalingUILayerNode.addChild( myChallengeAccordionBox );

    // Right above the resetAllButton
    this.bottomScalingUILayerNode.insertChild( this.bottomScalingUILayerNode.children.length - 1, ratioLockCheckbox );

    // Should be on top. Don't scale it because that messes with the scaling that the list box goes through, and changes
    // the dimensions of the scalingUILayerNode to make it too big. Discovered in https://github.com/phetsims/ratio-and-proportion/issues/273
    this.addChild( tickMarkRangeComboBoxParent );

    // pdom
    const previousOrder = this.pdomPlayAreaNode.pdomOrder || [];
    this.pdomPlayAreaNode.pdomOrder = previousOrder.concat( [
      this.tickMarkRangeComboBoxNode,
      tickMarkRangeComboBoxParent,
      myChallengeAccordionBox,
      ratioLockCheckbox
    ] );

    this.resetCreateScreenView = () => {
      handPositionsDescriber.reset();

      myChallengeAccordionBox.reset();
    };
  }

  public override layout( bounds: Bounds2 ): void {
    this.tickMarkRangeComboBoxNode.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( bounds );
  }

  public override reset(): void {
    this.resetCreateScreenView();
    super.reset();
  }

  public override getVoicingOverviewContent(): SpeakableResolvedResponse {
    return RatioAndProportionStrings.a11y.create.overviewSentenceStringProperty;
  }

  public override getVoicingDetailsContent(): SpeakableResolvedResponse {
    return this.createScreenSummaryNode.getDetailsButtonState();
  }

  public override getVoicingHintContent(): SpeakableResolvedResponse {
    return RatioAndProportionStrings.a11y.create.screenSummary.interactionHintStringProperty;
  }
}

ratioAndProportion.register( 'CreateScreenView', CreateScreenView );
export default CreateScreenView;