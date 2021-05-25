// Copyright 2020-2021, University of Colorado Boulder

/**
 * A central class that keeps the current state of how the ratio has been interacted with. This is used to determine
 * what cues to display on each RatioHalf's RatioHandNode.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// Even though there is only one Profile, it is still nice to use this pattern for color organizing.
class CueArrowsState {
  constructor() {

    // @public - if either hand has been moved with a mouse or touch or marker input
    this.interactedWithMouseProperty = new BooleanProperty( false );

    // @public - if either hand has been moved with a keyboard
    this.interactedWithKeyboardProperty = new BooleanProperty( false );

    // @public - if either hand currently has keyboard focus
    this.keyboardFocusedProperty = new BooleanProperty( false );

    // @public
    this.bothHands = {

      // whether or not to show the both hands cue for this ratio term.
      antecedentCueDisplayedProperty: new BooleanProperty( false ),
      consequentCueDisplayedProperty: new BooleanProperty( false ),


      // Has the BothHands interaction been interacted with yet? We need to be able to pass this info to RatioHalf,
      // which is created before BothHandsPDOMNode is created. So even though this acts like a derivedProperty that
      // BothHandsPDOMNode should control, we need to create it here.
      interactedWithProperty: new BooleanProperty( false )
    };
  }

  /**
   * @public
   */
  reset() {
    this.interactedWithMouseProperty.reset();
    this.interactedWithKeyboardProperty.reset();
    this.keyboardFocusedProperty.reset();
  }
}

ratioAndProportion.register( 'CueArrowsState', CueArrowsState );
export default CueArrowsState;