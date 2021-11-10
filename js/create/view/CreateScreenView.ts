// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import RAPColors from '../../common/view/RAPColors.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import CreateScreenSummaryNode from './CreateScreenSummaryNode.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import TickMarkRangeComboBoxNode from './TickMarkRangeComboBoxNode.js';
import RAPModel from '../../common/model/RAPModel.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';


class CreateScreenView extends RAPScreenView {

  private tickMarkRangeComboBoxNode: TickMarkRangeComboBoxNode;
  private resetCreateScreenView: () => void;

  constructor( model: RAPModel, backgroundColorProperty: Property<ColorDef>, tandem: Tandem ) {

    // For this screen, one Property controls the color of both hands.
    const handColorProperty = RAPColors.createScreenHandProperty;

    super( model, backgroundColorProperty, tandem, {
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty,
      bothHandsPDOMNodeOptions: {
        gestureDescriptionHelpText: ratioAndProportionStrings.a11y.create.bothHandsGestureDescriptionHelpText
      }
    } );

    const myChallengeAccordionBox = new MyChallengeAccordionBox( model.targetRatioProperty, model.ratio.lockedProperty, handColorProperty,
      this.tickMarkViewProperty, this.ratioDescriber, { tandem: tandem.createTandem( 'myChallengeAccordionBox' ) } );

    const tickMarkRangeComboBoxParent = new Node();

    // @private
    this.tickMarkRangeComboBoxNode = new TickMarkRangeComboBoxNode( this.tickMarkRangeProperty, tickMarkRangeComboBoxParent, this.tickMarkViewProperty );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new CreateScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.tupleProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      this.tickMarkRangeProperty,
      myChallengeAccordionBox
    ) );

    const ratioLockedUtterance = new ActivationUtterance();

    const lockRatioCheckbox = new Checkbox( new RichText( ratioAndProportionStrings.lockRatio ), model.ratio.lockedProperty, {
      accessibleName: ratioAndProportionStrings.lockRatio,
      helpText: ratioAndProportionStrings.a11y.lockRatioHelpText,
      maxWidth: 250, // empirically determined

      // phet-io
      tandem: tandem.createTandem( 'lockRatioCheckbox' )
    } );
    lockRatioCheckbox.touchArea = lockRatioCheckbox.localBounds.dilatedXY( 8, 0.5 * lockRatioCheckbox.height );
    lockRatioCheckbox.mouseArea = lockRatioCheckbox.localBounds.dilatedXY( 8, 0.5 * lockRatioCheckbox.height );

    // TODO: this should not be a separate FireListener. Instead we should be able to use the checkbox somehow. https://github.com/phetsims/sun/issues/701
    lockRatioCheckbox.addInputListener( new FireListener( {
      attach: false, // Since this is the second PressListener to be added to the checkbox (so annoying)
      fire: () => {
        ratioLockedUtterance.alert = model.ratio.lockedProperty.value ? ratioAndProportionStrings.a11y.lockRatioCheckboxContextResponse :
                                     ratioAndProportionStrings.a11y.ratioNoLongerLocked;

        // @ts-ignore
        this.alertDescriptionUtterance( ratioLockedUtterance );
      },

      // phet-io
      tandem: Tandem.OPT_OUT
    } ) );

    // The "lock ratio" checkbox should not be enabled when the ratio is not in proportion.
    Property.multilink( [
      model.inProportionProperty,
      model.ratioFitnessProperty
    ], ( inProportion: boolean ) => {
      lockRatioCheckbox.enabledProperty.value = inProportion;

      // If the checkbox get's disabled, then unlock the ratio.
      if ( !lockRatioCheckbox.enabledProperty.value ) {
        model.ratio.lockedProperty.value = false;
      }
    } );

    // children - remember to not blow away children set by parent
    this.topScalingUILayerNode.addChild( myChallengeAccordionBox );
    this.topScalingUILayerNode.addChild( this.tickMarkRangeComboBoxNode );
    this.bottomScalingUILayerNode.addChild( lockRatioCheckbox );

    // Should be on top. Don't scale it because that messes with the scaling that the list box goes through, and changes
    // the dimensions of the scalingUILayerNode to make it too big. Discovered in https://github.com/phetsims/ratio-and-proportion/issues/273
    this.addChild( tickMarkRangeComboBoxParent );

    // pdom
    // @ts-ignore
    this.pdomPlayAreaNode.pdomOrder = ( this.pdomPlayAreaNode as any ).pdomOrder.concat( [
      this.tickMarkRangeComboBoxNode,
      tickMarkRangeComboBoxParent,
      myChallengeAccordionBox,
      lockRatioCheckbox
    ] );

    // static layout
    lockRatioCheckbox.right = this.resetAllButton.right;
    lockRatioCheckbox.bottom = this.resetAllButton.top - 20;

    // ui layer node layout (scales based on width). This only needs to be laid out once, as the container is scaled.
    this.tickMarkRangeComboBoxNode.right = myChallengeAccordionBox.right = tickMarkRangeComboBoxParent.right = this.tickMarkViewRadioButtonGroup.right;
    this.tickMarkRangeComboBoxNode.top = tickMarkRangeComboBoxParent.top = this.tickMarkViewRadioButtonGroup.bottom + 10;
    myChallengeAccordionBox.top = this.tickMarkRangeComboBoxNode.bottom + 30;

    // @private
    this.resetCreateScreenView = () => {
      myChallengeAccordionBox.reset();
    };
  }

  /**
   * @override
   * @public
   * @param {Bounds2} bounds
   */
  layout( bounds: Bounds2 ): void {
    this.tickMarkRangeComboBoxNode.hideListBox(); // hidden when layout changes, see https://github.com/phetsims/ratio-and-proportion/issues/324
    super.layout( bounds );
  }

  /**
   * @public
   * @override
   */
  reset(): void {
    this.resetCreateScreenView();
    super.reset();
  }
}

ratioAndProportion.register( 'CreateScreenView', CreateScreenView );
export default CreateScreenView;