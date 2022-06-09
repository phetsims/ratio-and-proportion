// Copyright 2020-2022, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import { NodeOptions } from '../../../../scenery/js/imports.js';

class RAPKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  /**
   * @param challengeHelpSection - keyboard help section for determining how to change the target ratio
   * @param [options] - TODO: use TwoColumnKeyboardHelpContentOptions when available, https://github.com/phetsims/ratio-and-proportion/issues/404
   */
  public constructor( challengeHelpSection: KeyboardHelpSection, options?: NodeOptions ) {

    const moveLeftOrRightHandHelpSection = new SliderControlsKeyboardHelpSection( {
      headingString: ratioAndProportionStrings.moveHandsIndividually,
      verbString: ratioAndProportionStrings.move,
      sliderString: ratioAndProportionStrings.leftOrRightHand,
      maximumString: ratioAndProportionStrings.top,
      minimumString: ratioAndProportionStrings.bottom,
      arrowKeyIconDisplay: SliderControlsKeyboardHelpSection.ArrowKeyIconDisplay.UP_DOWN // on cue up/down arrows, not left/right also.
    } );

    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    const leftContent = [ moveLeftOrRightHandHelpSection, new BothHandsHelpSection() ];
    const rightContent = [ challengeHelpSection, basicActionsHelpSection ];

    super( leftContent, rightContent, options );
  }
}

class BothHandsHelpSection extends KeyboardHelpSection {

  // TODO: use KeyboardHelpSection when available, https://github.com/phetsims/ratio-and-proportion/issues/404
  public constructor( options?: NodeOptions ) {

    const moveLeftHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveLeftHand,
      KeyboardHelpIconFactory.iconRow( [ new LetterKeyNode( 'W' ), new LetterKeyNode( 'S' ) ] ), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.leftHandDescription
      } );

    const moveRightHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveRightHand,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.rightHandDescription
      } );

    const moveInSmallerSteps = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveHandsInSmallerSteps,
      TextKeyNode.shift(), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.handsInSmallerStepsDescription
      } );

    const jumpBothHands = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpBothHands,
      KeyboardHelpIconFactory.iconToIcon( new NumberKeyNode( '0' ), new NumberKeyNode( '9' ) ), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.jumpBothHandsDescription
      } );

    super( ratioAndProportionStrings.moveBothHandsSimultaneously,
      [ moveLeftHand, moveRightHand, moveInSmallerSteps, jumpBothHands ], options );
  }
}

ratioAndProportion.register( 'RAPKeyboardHelpContent', RAPKeyboardHelpContent );
export default RAPKeyboardHelpContent;