// Copyright 2020-2022, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection, { KeyboardHelpSectionOptions } from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent, { TwoColumnKeyboardHelpContentOptions } from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';

type SelfOptions = EmptySelfOptions;
export type RAPKeyboardHelpContentOptions = SelfOptions & TwoColumnKeyboardHelpContentOptions;

class RAPKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  /**
   * @param challengeHelpSection - keyboard help section for determining how to change the target ratio
   * @param [providedOptions]
   */
  public constructor( challengeHelpSection: KeyboardHelpSection, providedOptions?: RAPKeyboardHelpContentOptions ) {

    // TODO: Support dynamic keyboard help content, https://github.com/phetsims/ratio-and-proportion/issues/499
    const moveLeftOrRightHandHelpSection = new SliderControlsKeyboardHelpSection( {
      headingString: RatioAndProportionStrings.moveHandsIndividually,
      verbString: RatioAndProportionStrings.move,
      sliderString: RatioAndProportionStrings.leftOrRightHand,
      maximumString: RatioAndProportionStrings.top,
      minimumString: RatioAndProportionStrings.bottom,
      arrowKeyIconDisplay: SliderControlsKeyboardHelpSection.ArrowKeyIconDisplay.UP_DOWN // on cue up/down arrows, not left/right also.
    } );

    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    const leftContent = [ moveLeftOrRightHandHelpSection, new BothHandsHelpSection() ];
    const rightContent = [ challengeHelpSection, basicActionsHelpSection ];

    super( leftContent, rightContent, providedOptions );
  }
}

class BothHandsHelpSection extends KeyboardHelpSection {

  public constructor( options?: KeyboardHelpSectionOptions ) {

    const moveLeftHand = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveLeftHand,
      KeyboardHelpIconFactory.iconRow( [ new LetterKeyNode( 'W' ), new LetterKeyNode( 'S' ) ] ), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.leftHandDescription
      } );

    const moveRightHand = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveRightHand,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.rightHandDescription
      } );

    const moveInSmallerSteps = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.moveHandsInSmallerSteps,
      TextKeyNode.shift(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.handsInSmallerStepsDescription
      } );

    const jumpBothHands = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpBothHands,
      KeyboardHelpIconFactory.iconToIcon( new NumberKeyNode( '0' ), new NumberKeyNode( '9' ) ), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpBothHandsDescription
      } );

    super( RatioAndProportionStrings.moveBothHandsSimultaneously,
      [ moveLeftHand, moveRightHand, moveInSmallerSteps, jumpBothHands ], options );
  }
}

ratioAndProportion.register( 'RAPKeyboardHelpContent', RAPKeyboardHelpContent );
export default RAPKeyboardHelpContent;