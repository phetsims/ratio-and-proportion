// Copyright 2020, University of Colorado Boulder

/**
 * An AccordionBox with two NumberPickers in it that determines the targetRatioProperty in the model ("My Challenge" value).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

const PICKER_SCALE = 1.5;
const ICON_SCALE = .9;
const DEFAULT_EXPANDED = false;

class MyChallengeAccordionBox extends AccordionBox {

  /**
   * @param {Property.<number>} targetRatioProperty
   * @param {Property.<ColorDef>} handColorProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {Object} [options]
   */
  constructor( targetRatioProperty, handColorProperty, tickMarkViewProperty, ratioDescriber, options ) {

    options = merge( {
      titleNode: new RichText( ratioAndProportionStrings.myChallenge, {
        font: new PhetFont( 20 ),
        maxWidth: 250 // empirically determined
      } ),
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
    }, options );

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFraction = Fraction.fromDecimal( targetRatioProperty.value );
    const rangeProperty = new Property( new Range( 1, 10 ) );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.numerator ), 'unsupported numerator' );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.denominator ), 'unsupported denominator' );

    const targetAntecedentProperty = new NumberProperty( initialRatioFraction.numerator );
    const targetConsequentProperty = new NumberProperty( initialRatioFraction.denominator );

    const antecedentNumberPicker = new NumberPicker( targetAntecedentProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.leftValue,
      a11yDependencies: [ targetConsequentProperty ],
      a11yCreateContextResponseAlert: () => ratioDescriber.getTargetRatioChangeAlert( targetAntecedentProperty.value, targetConsequentProperty.value )
    } );
    const leftRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ antecedentNumberPicker ] } ) ]
    } );

    const consequentNumberPicker = new NumberPicker( targetConsequentProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.rightValue,
      a11yDependencies: [ targetAntecedentProperty ],
      a11yCreateContextResponseAlert: () => ratioDescriber.getTargetRatioChangeAlert( targetAntecedentProperty.value, targetConsequentProperty.value )
    } );
    const rightRatioSelector = new VBox( {
      align: 'origin',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, tickMarkViewProperty, {
          handColor: handColorProperty.value, handNodeOptions: { scale: ICON_SCALE }
        } ),
        new Node( { children: [ consequentNumberPicker ] } ) ]
    } );

    const myChallengeContent = new HBox( {
      spacing: 40,
      tagName: 'div',
      descriptionContent: ratioAndProportionStrings.a11y.create.myChallengeHelpText, // help text for the content
      children: [ leftRatioSelector, rightRatioSelector ]
    } );
    super( myChallengeContent, options );

    // @public
    this.targetAntecedentProperty = targetAntecedentProperty;
    this.targetConsequentProperty = targetConsequentProperty;

    this.expandedProperty.value = DEFAULT_EXPANDED;

    const accordionBoxUtterance = new ActivationUtterance();
    this.expandedProperty.lazyLink( expanded => {
      accordionBoxUtterance.alert = expanded ?
                                    ratioDescriber.getCurrentChallengeSentence( targetAntecedentProperty.value, targetConsequentProperty.value ) :
                                    ratioAndProportionStrings.a11y.ratio.currentChallengeHidden;
      phet.joist.sim.utteranceQueue.addToBack( accordionBoxUtterance );
    } );

    Property.multilink( [ targetAntecedentProperty, targetConsequentProperty ], ( targetAntecedent, targetConsequent ) => {
      targetRatioProperty.value = targetAntecedent / targetConsequent;
    } );
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.expandedProperty.value = DEFAULT_EXPANDED;

    this.targetAntecedentProperty.reset();
    this.targetConsequentProperty.reset();
  }
}

ratioAndProportion.register( 'MyChallengeAccordionBox', MyChallengeAccordionBox );
export default MyChallengeAccordionBox;