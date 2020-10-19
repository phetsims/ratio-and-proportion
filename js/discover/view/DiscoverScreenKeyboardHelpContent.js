// Copyright 2020, University of Colorado Boulder

/**
 * Content for the keyboard help dialog in the discover screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ComboBoxKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/ComboBoxKeyboardHelpSection.js';
import RAPKeyboardHelpContent from '../../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class DiscoverScreenKeyboardHelpContent extends RAPKeyboardHelpContent {
  constructor() {
    super( new ComboBoxKeyboardHelpSection( ratioAndProportionStrings.challengeRatio ) );
  }
}

ratioAndProportion.register( 'DiscoverScreenKeyboardHelpContent', DiscoverScreenKeyboardHelpContent );
export default DiscoverScreenKeyboardHelpContent;