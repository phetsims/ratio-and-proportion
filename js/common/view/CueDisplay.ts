// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds the possible cue visuals that can be displayed for each ratio hand.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';

class CueDisplay extends EnumerationValue {
  public static NONE = new CueDisplay();
  public static W_S = new CueDisplay();
  public static UP_DOWN = new CueDisplay();
  public static ARROWS = new CueDisplay();

  public static enumeration = new Enumeration( CueDisplay );
}

export default CueDisplay;
