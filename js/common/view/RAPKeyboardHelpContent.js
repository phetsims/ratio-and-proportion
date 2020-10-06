// Copyright 2020, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in Ratio and Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowKeyNode from '../../../../scenery-phet/js/keyboard/ArrowKeyNode.js';
import GeneralKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import SliderKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import LetterKeyNode from '../../../../scenery-phet/js/keyboard/LetterKeyNode.js';
import ShiftKeyNode from '../../../../scenery-phet/js/keyboard/ShiftKeyNode.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class RAPKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  /**
   * @param {KeyboardHelpSection} challengeHelpSection - keyboard help section for determining how to change the target ratio
   * @param {Object} [options]
   */
  constructor( challengeHelpSection, options ) {

    const moveLeftOrRightHandHelpSection = new SliderKeyboardHelpSection( {
      headingString: 'Move Left or Right Hand'
    } );

    const generalNavigationHelpSection = new GeneralKeyboardHelpSection( {
      withCheckboxContent: true,
      withGroupContent: true
    } );

    const leftContent = [ moveLeftOrRightHandHelpSection, new BothHandsHelpSection() ];
    const rightContent = [ challengeHelpSection, generalNavigationHelpSection ];

    super( leftContent, rightContent );
  }
}

/**
 * @param {Object} [options]
 * @constructor
 */
class BothHandsHelpSection extends KeyboardHelpSection {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {

      headingOptions: {
        descriptionContent: ratioAndProportionStrings.a11y.keyboardHelp.bothHandsDescription,
        appendDescription: true
      }
    }, options );

    const moveLeftHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveLeftHand,
      KeyboardHelpIconFactory.iconRow( [ new LetterKeyNode( 'W' ), new LetterKeyNode( 'S' ) ] ),
      ratioAndProportionStrings.a11y.keyboardHelp.leftHandDescription );

    const moveRightHand = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveRightHand,
      KeyboardHelpIconFactory.iconRow( [ new ArrowKeyNode( 'up' ), new ArrowKeyNode( 'down' ) ] ),
      ratioAndProportionStrings.a11y.keyboardHelp.rightHandDescription );

    const moveInSmallerSteps = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.moveHandsInSmallerSteps,
      new ShiftKeyNode(),
      ratioAndProportionStrings.a11y.keyboardHelp.handsInSmallerStepsDescription );

    super( ratioAndProportionStrings.bothHands, [ moveLeftHand, moveRightHand, moveInSmallerSteps ], options );
  }
}

ratioAndProportion.register( 'RAPKeyboardHelpContent', RAPKeyboardHelpContent );
export default RAPKeyboardHelpContent;