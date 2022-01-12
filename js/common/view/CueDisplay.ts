// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds the possible cue visuals that can be displayed for each ratio hand.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import RichEnumeration from '../../../../phet-core/js/RichEnumeration.js';

class CueDisplay extends EnumerationValue {
  static NONE = new CueDisplay();
  static W_S = new CueDisplay();
  static UP_DOWN = new CueDisplay();
  static ARROWS = new CueDisplay();

  static enumeration = new RichEnumeration( CueDisplay );
}

export default CueDisplay;
