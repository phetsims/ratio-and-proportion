// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Color from '../../../../scenery/js/util/Color.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import RAPScreenView from '../../common/view/RAPScreenView.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import CreateScreenSummaryNode from './CreateScreenSummaryNode.js';
import TickMarkRangeComboBox from './TickMarkRangeComboBox.js';

const PICKER_SCALE = 1.5;
const ICON_SCALE = .9;
const DEFAULT_EXPANDED = false;

class CreateScreenView extends RAPScreenView {

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const tickMarkRangeProperty = new NumberProperty( 10 );

    // For this screen, one Property controls the color of both hands.
    // TODO: duplicated with CreateScreenIcon
    const handColorProperty = new Property( new Color( '#8d5cbd' ) );

    super( model, tandem, {
      tickMarkRangeProperty: tickMarkRangeProperty,
      leftHandColorProperty: handColorProperty,
      rightHandColorProperty: handColorProperty
    } );

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFraction = new Fraction( model.ratio.numeratorProperty.value * 100, model.ratio.denominatorProperty.value * 100 );
    initialRatioFraction.reduce();
    const rangeProperty = new Property( new Range( 1, 10 ) );

    const targetNumeratorProperty = new NumberProperty( initialRatioFraction.numerator );
    const targetDenominatorProperty = new NumberProperty( initialRatioFraction.denominator );

    const numeratorNumberPicker = new NumberPicker( targetNumeratorProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.leftValue,
      a11yDependencies: [ targetDenominatorProperty ],
      a11yCreateContextResponseAlert: () => this.ratioDescriber.getTargetRatioChangeAlert( targetNumeratorProperty.value, targetDenominatorProperty.value )
    } );
    const leftRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, this.tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ numeratorNumberPicker ] } ) ]
    } );

    const denominatorNumberPicker = new NumberPicker( targetDenominatorProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.rightValue,
      a11yDependencies: [ targetNumeratorProperty ],
      a11yCreateContextResponseAlert: () => this.ratioDescriber.getTargetRatioChangeAlert( targetNumeratorProperty.value, targetDenominatorProperty.value )
    } );
    const rightRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, this.tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ denominatorNumberPicker ] } ) ]
    } );

    Property.multilink( [ targetNumeratorProperty, targetDenominatorProperty ], ( targetNumerator, targetDenominator ) => {
      model.targetRatioProperty.value = targetNumerator / targetDenominator;
    } );

    const myChallengeContent = new HBox( {
      spacing: 40,
      tagName: 'div',
      descriptionContent: ratioAndProportionStrings.a11y.create.myChallengeHelpText, // help text for the content
      children: [ leftRatioSelector, rightRatioSelector ]
    } );
    const myChallengeAccordionBox = new AccordionBox( myChallengeContent, {
      titleNode: new RichText( ratioAndProportionStrings.myChallenge, { font: new PhetFont( 20 ) } ),
      accessibleName: ratioAndProportionStrings.myChallenge,
      titleAlignX: 'left',
      contentXMargin: 26,
      contentYMargin: 15,
      contentYSpacing: 15,

      // Copied from NLCConstants.js, see https://github.com/phetsims/ratio-and-proportion/issues/58#issuecomment-646377333
      cornerRadius: 5,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 15,
        touchAreaYDilation: 15,
        mouseAreaXDilation: 5,
        mouseAreaYDilation: 5
      }
    } );
    myChallengeAccordionBox.expandedProperty.value = DEFAULT_EXPANDED;

    const accordionBoxUtterance = new ActivationUtterance();
    myChallengeAccordionBox.expandedProperty.lazyLink( expanded => {
      accordionBoxUtterance.alert = expanded ?
                                    this.ratioDescriber.getCurrentChallengeSentence( targetNumeratorProperty.value, targetDenominatorProperty.value ) :
                                    ratioAndProportionStrings.a11y.ratio.currentChallengeHidden;
      phet.joist.sim.utteranceQueue.addToBack( accordionBoxUtterance );
    } );

    const tickMarkRangeComboBoxParent = new Node();

    const tickMarkRangeComboBox = new TickMarkRangeComboBox( tickMarkRangeProperty, tickMarkRangeComboBoxParent, this.tickMarkViewProperty );

    // set this after the supertype has initialized the view code needed to create the screen summary
    this.setScreenSummaryContent( new CreateScreenSummaryNode(
      model.ratioFitnessProperty,
      model.ratio.numeratorProperty,
      model.ratio.denominatorProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      tickMarkRangeProperty,
      targetNumeratorProperty,
      targetDenominatorProperty
    ) );

    const ratioLockedUtterance = new ActivationUtterance( { alert: ratioAndProportionStrings.a11y.lockRatioCheckboxContextResponse } );

    const lockRatioCheckbox = new Checkbox( new RichText( ratioAndProportionStrings.lockRatio ), model.ratio.lockedProperty, {
      accessibleName: ratioAndProportionStrings.lockRatio,
      helpText: ratioAndProportionStrings.a11y.lockRatioHelpText
    } );

    // TODO: this should not be a separate FireListener. Instead we should be able to use the checkbox somehow.
    lockRatioCheckbox.addInputListener( new FireListener( {
      fire: () => phet.joist.sim.utteranceQueue.addToBack( ratioLockedUtterance )
    } ) );

    // The "lock ratio" checkbox should not be enabled when the ratio is not in proportion.
    model.ratioFitnessProperty.link( () => {
      lockRatioCheckbox.enabledProperty.value = model.inProportion();

      // If the checkbox get's disabled, then unlock the ratio.
      if ( !lockRatioCheckbox.enabledProperty.value ) {
        model.ratio.lockedProperty.value = false;
      }
    } );

    // children - remember to not blow away children set by parent
    this.topScalingUILayerNode.addChild( myChallengeAccordionBox );
    this.topScalingUILayerNode.addChild( tickMarkRangeComboBox );
    this.topScalingUILayerNode.addChild( tickMarkRangeComboBoxParent ); // Should be on top
    this.bottomScalingUILayerNode.addChild( lockRatioCheckbox );

    // pdom
    this.pdomPlayAreaNode.accessibleOrder = this.pdomPlayAreaNode.accessibleOrder.concat( [
      tickMarkRangeComboBox,
      tickMarkRangeComboBoxParent,
      myChallengeAccordionBox,
      lockRatioCheckbox
    ] );

    // static layout
    lockRatioCheckbox.right = this.resetAllButton.right;
    lockRatioCheckbox.bottom = this.resetAllButton.top - 20;

    // ui layer node layout (scales based on width). This only needs to be layed out once, as the container is scaled.
    tickMarkRangeComboBox.right = myChallengeAccordionBox.right = tickMarkRangeComboBoxParent.right = this.tickMarkViewRadioButtonGroup.right;
    tickMarkRangeComboBox.top = tickMarkRangeComboBoxParent.top = this.tickMarkViewRadioButtonGroup.bottom + 10;
    myChallengeAccordionBox.top = tickMarkRangeComboBox.bottom + 30;

    // @private
    this.resetCreateScreenView = () => {
      targetNumeratorProperty.reset();
      targetDenominatorProperty.reset();
      myChallengeAccordionBox.expandedProperty.value = DEFAULT_EXPANDED;
    };
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.resetCreateScreenView();
    super.reset();
  }
}

ratioAndProportion.register( 'CreateScreenView', CreateScreenView );
export default CreateScreenView;