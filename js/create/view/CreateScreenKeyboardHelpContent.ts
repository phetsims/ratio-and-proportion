// Copyright 2020-2022, University of Colorado Boulder

/**
 * Content for the keyboard help dialog for the Create screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import RAPKeyboardHelpContent from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import { NodeOptions } from '../../../../scenery/js/imports.js';

class CreateScreenKeyboardHelpContent extends RAPKeyboardHelpContent {
  constructor() {
    super( new MyChallengeHelpSection() );
  }
}

class MyChallengeHelpSection extends KeyboardHelpSection {

  // TODO: use KeyboardHelpSectionOptions when possible, https://github.com/phetsims/ratio-and-proportion/issues/404
  constructor( options?: NodeOptions ) {

    const setHandRatioValue = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.setHandRatioValue,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.setHandRatioValueDescription
      } );

    const jumpToMinimum = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpToMinimum,
      TextKeyNode.home(), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.jumpToMinimumDescription
      } );

    const jumpToMaximum = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpToMaximum,
      TextKeyNode.end(), {
        labelInnerContent: ratioAndProportionStrings.a11y.keyboardHelp.jumpToMaximumDescription
      } );

    super( ratioAndProportionStrings.setMyRatioChallenge, [ setHandRatioValue, jumpToMinimum, jumpToMaximum ], options );
  }
}

ratioAndProportion.register( 'CreateScreenKeyboardHelpContent', CreateScreenKeyboardHelpContent );
export default CreateScreenKeyboardHelpContent;