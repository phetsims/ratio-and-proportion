// Copyright 2020-2021, University of Colorado Boulder

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
import { HBox } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { RichText } from '../../../../scenery/js/imports.js';
import { VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import { Color } from '../../../../scenery/js/imports.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import TickMarkView from '../../common/view/TickMarkView.js';

const PICKER_SCALE = 1.5;
const ICON_SCALE = 0.9;
const DEFAULT_EXPANDED = false;

class MyChallengeAccordionBox extends AccordionBox {

  targetAntecedentProperty: Property<number>;
  targetConsequentProperty: Property<number>;
  private resetMyChallengeAccordionBox: () => void;

  /**
   * @param {Property.<number>} targetRatioProperty
   * @param {Property.<boolean>} ratioLockedProperty
   * @param {Property.<ColorDef>} handColorProperty
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {Object} [options]
   */
  constructor( targetRatioProperty: Property<number>, ratioLockedProperty: Property<boolean>,
               handColorProperty: Property<Color>, tickMarkViewProperty: Property<TickMarkView>,
               ratioDescriber: RatioDescriber, options: AccordionBoxOptions ) {

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
      },

      // phet-io
      tandem: Tandem.REQUIRED
    }, options ) as Required<AccordionBoxOptions>;

    // Allow us to get the reduced fraction as the initial value of the custom "My Challenge"
    const initialRatioFraction = Fraction.fromDecimal( targetRatioProperty.value );
    const rangeProperty = new Property( new Range( 1, 10 ) );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.numerator ), 'unsupported numerator' );
    assert && assert( rangeProperty.value.contains( initialRatioFraction.denominator ), 'unsupported denominator' );

    const targetAntecedentProperty = new NumberProperty( initialRatioFraction.numerator );
    const targetConsequentProperty = new NumberProperty( initialRatioFraction.denominator );

    // @private
    const ratioUnlockedFromMyChallenge = new Utterance( {
      alert: ratioAndProportionStrings.a11y.ratioNoLongerLocked
    } );

    // When either of these change, then the model is about to unlock the ratio, so alert that. This relies on listener
    // order to work, but I can't seem to discover another way to make sure that the ratio unlocked description get's
    // before the main NumberPicker context response in a place where we have information about if the ratio was just
    // unlocked, see https://github.com/phetsims/ratio-and-proportion/issues/227 for extensive investigation. NOTE:
    // This should be above the creation of the NumberPickers to make sure that this fires before the RAPModel.targetRatioProperty
    // changes.
    Property.multilink( [ targetAntecedentProperty, targetConsequentProperty ], () => {

      // if currently locked, then it is about to be unlocked
            ratioLockedProperty.value && this.alertDescriptionUtterance( ratioUnlockedFromMyChallenge );
    } );

    const antecedentNumberPicker = new NumberPicker( targetAntecedentProperty, rangeProperty, {
      scale: PICKER_SCALE,
      color: handColorProperty.value,
      center: Vector2.ZERO,
      accessibleName: ratioAndProportionStrings.a11y.leftValue,
      a11yDependencies: [ targetConsequentProperty ],
      a11yCreateAriaValueText: ratioDescriber.getWordFromNumber,
      a11yCreateContextResponseAlert: () => ratioDescriber.getTargetRatioChangeAlert( targetAntecedentProperty.value, targetConsequentProperty.value ),

      // phet-io
      tandem: options.tandem.createTandem( 'antecedentNumberPicker' )
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
      a11yCreateAriaValueText: ratioDescriber.getWordFromNumber,
      a11yCreateContextResponseAlert: () => ratioDescriber.getTargetRatioChangeAlert( targetAntecedentProperty.value, targetConsequentProperty.value ),
      tandem: options.tandem.createTandem( 'consequentNumberPicker' )
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
    this.expandedProperty.lazyLink( ( expanded: boolean ) => {
      accordionBoxUtterance.alert = expanded ?
                                    ratioDescriber.getCurrentChallengeSentence( targetAntecedentProperty.value, targetConsequentProperty.value ) :
                                    ratioAndProportionStrings.a11y.ratio.currentChallengeHidden;
            this.alertDescriptionUtterance( accordionBoxUtterance );
    } );

    Property.multilink( [ targetAntecedentProperty, targetConsequentProperty ],
      ( targetAntecedent: number, targetConsequent: number ) => {
        targetRatioProperty.value = targetAntecedent / targetConsequent;
      } );

    // @private
    this.resetMyChallengeAccordionBox = () => {
      this.expandedProperty.value = DEFAULT_EXPANDED;

      this.targetAntecedentProperty.reset();
      this.targetConsequentProperty.reset();

      ratioUnlockedFromMyChallenge.reset();
    };
  }

  /**
   * @public
   * @override
   */
  reset(): void {
    super.reset();
    this.resetMyChallengeAccordionBox();
  }
}

ratioAndProportion.register( 'MyChallengeAccordionBox', MyChallengeAccordionBox );
export default MyChallengeAccordionBox;