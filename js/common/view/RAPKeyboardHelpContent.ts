// Copyright 2020-2021, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GeneralKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import SliderKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import NumberKeyNode from '../../../../scenery-phet/js/keyboard/NumberKeyNode.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class RAPKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  /**
   * @param {KeyboardHelpSection} challengeHelpSection - keyboard help section for determining how to change the target ratio
   * @param {Object} [options]
   */
  constructor( challengeHelpSection: KeyboardHelpSection, options?: NodeOptions ) {

    const moveLeftOrRightHandHelpSection = new SliderKeyboardHelpSection( {
      headingString: ratioAndProportionStrings.moveHandsIndividually,
      verbString: ratioAndProportionStrings.move,
      sliderString: ratioAndProportionStrings.leftOrRightHand,
      maximumString: ratioAndProportionStrings.top,
      minimumString: ratioAndProportionStrings.bottom,
      arrowKeyIconDisplay: ( SliderKeyboardHelpSection.ArrowKeyIconDisplay as any ).UP_DOWN // on cue up/down arrows, not left/right also. TODO https://github.com/phetsims/ratio-and-proportion/issues/404
    } );

    const generalNavigationHelpSection = new GeneralKeyboardHelpSection( {
      withCheckboxContent: true
    } );

    const leftContent = [ moveLeftOrRightHandHelpSection, new BothHandsHelpSection() ];
    const rightContent = [ challengeHelpSection, generalNavigationHelpSection ];

    super( leftContent, rightContent, options );
  }
}

class BothHandsHelpSection extends KeyboardHelpSection {

  /**
   * @param {Object} [options]
   */
  constructor( options?: NodeOptions ) {

    const moveLeftHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveLeftHand,
      KeyboardHelpIconFactory.iconRow( [ new LetterKeyNode( 'W' ), new LetterKeyNode( 'S' ) ] ),
      ratioAndProportionStrings.a11y.keyboardHelp.leftHandDescription );

    const moveRightHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveRightHand,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(),
      ratioAndProportionStrings.a11y.keyboardHelp.rightHandDescription );

    const moveInSmallerSteps = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveHandsInSmallerSteps,
      TextKeyNode.shift(),
      ratioAndProportionStrings.a11y.keyboardHelp.handsInSmallerStepsDescription );

    const jumpBothHands = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpBothHands,
      KeyboardHelpIconFactory.iconToIcon( new NumberKeyNode( '0' ), new NumberKeyNode( '9' ) ),
      ratioAndProportionStrings.a11y.keyboardHelp.jumpBothHandsDescription );

    super( ratioAndProportionStrings.moveBothHandsSimultaneously,
      [ moveLeftHand, moveRightHand, moveInSmallerSteps, jumpBothHands ], options );
  }
}

ratioAndProportion.register( 'RAPKeyboardHelpContent', RAPKeyboardHelpContent );
export default RAPKeyboardHelpContent;