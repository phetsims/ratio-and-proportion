// Copyright 2020, University of Colorado Boulder

/**
 * Content for the keyboard help dialog for the Create screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ArrowKeyNode from '../../../../scenery-phet/js/keyboard/ArrowKeyNode.js';
import EndKeyNode from '../../../../scenery-phet/js/keyboard/EndKeyNode.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import HomeKeyNode from '../../../../scenery-phet/js/keyboard/HomeKeyNode.js';
import RAPKeyboardHelpContent from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class CreateScreenKeyboardHelpContent extends RAPKeyboardHelpContent {

  constructor() {
    super( new MyChallengeHelpSection() );
  }
}

/**
 * @param {Object} [options]
 * @constructor
 */
class MyChallengeHelpSection extends KeyboardHelpSection {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    const setHandRatioValue = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.setHandRatioValue,
      KeyboardHelpIconFactory.iconRow( [ new ArrowKeyNode( 'up' ), new ArrowKeyNode( 'down' ) ] ),
      ratioAndProportionStrings.a11y.keyboardHelp.setHandRatioValueDescription );

    const jumpToMinimum = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpToMinimum,
      new HomeKeyNode(),
      ratioAndProportionStrings.a11y.keyboardHelp.jumpToMinimumDescription );

    const jumpToMaximum = KeyboardHelpSection.labelWithIcon( ratioAndProportionStrings.jumpToMaximum,
      new EndKeyNode(),
      ratioAndProportionStrings.a11y.keyboardHelp.jumpToMaximumDescription );

    super( ratioAndProportionStrings.setMyRatioChallenge, [ setHandRatioValue, jumpToMinimum, jumpToMaximum ], options );
  }
}

ratioAndProportion.register( 'CreateScreenKeyboardHelpContent', CreateScreenKeyboardHelpContent );
export default CreateScreenKeyboardHelpContent;