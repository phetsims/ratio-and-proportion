// Copyright 2020-2022, University of Colorado Boulder

/**
 * Content for the keyboard help dialog for the Create screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TextKeyNode from '../../../../scenery-phet/js/keyboard/TextKeyNode.js';
import RAPKeyboardHelpContent, { RAPKeyboardHelpContentOptions } from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';

type SelfOptions = EmptySelfOptions;
type CreateScreenKeyboardHelpContentOptions = SelfOptions & RAPKeyboardHelpContentOptions;

class CreateScreenKeyboardHelpContent extends RAPKeyboardHelpContent {
  public constructor() {
    super( new MyChallengeHelpSection() );
  }
}

class MyChallengeHelpSection extends KeyboardHelpSection {

  public constructor( options?: CreateScreenKeyboardHelpContentOptions ) {

    // TODO: Support help sections, https://github.com/phetsims/ratio-and-proportion/issues/499
    const setHandRatioValue = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.setHandRatioValue,
      KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.setHandRatioValueDescription
      } );

    const jumpToMinimum = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpToMinimum,
      TextKeyNode.home(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpToMinimumDescription
      } );

    const jumpToMaximum = KeyboardHelpSectionRow.labelWithIcon( RatioAndProportionStrings.jumpToMaximum,
      TextKeyNode.end(), {
        labelInnerContent: RatioAndProportionStrings.a11y.keyboardHelp.jumpToMaximumDescription
      } );

    super( RatioAndProportionStrings.setMyRatioChallenge, [ setHandRatioValue, jumpToMinimum, jumpToMaximum ], options );
  }
}

ratioAndProportion.register( 'CreateScreenKeyboardHelpContent', CreateScreenKeyboardHelpContent );
export default CreateScreenKeyboardHelpContent;