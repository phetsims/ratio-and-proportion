// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of both hands reletive to each other.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class BothHandsDescriber {

  /**
   * @param {Property.<number>}leftValueProperty
   * @param {Property.<number>}rightValueProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   */
  constructor( leftValueProperty, rightValueProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber ) {

    // @private - from model
    this.leftValueProperty = leftValueProperty;
    this.rightValueProperty = rightValueProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.handPositionsDescriber = handPositionsDescriber;
  }

  /**
   * @public
   * @returns {string}
   */
  getRatioAndBothHandPositionsText() {
    const tickMarkView = this.tickMarkViewProperty.value;
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsAlert, {
      leftPosition: this.handPositionsDescriber.getHandPosition( this.leftValueProperty, tickMarkView ),
      rightPosition: this.handPositionsDescriber.getHandPosition( this.rightValueProperty, tickMarkView, false ),
      fitness: this.ratioDescriber.getRatioFitness()
    } );
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;