// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of both hands reletive to each other.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';

class BothHandsDescriber {

  /**
   * @param {Property.<number>} numeratorProperty
   * @param {Property.<number>} denominatorProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   */
  constructor( numeratorProperty, denominatorProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber ) {

    // @private - from model
    this.numeratorProperty = numeratorProperty;
    this.denominatorProperty = denominatorProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.handPositionsDescriber = handPositionsDescriber;
  }

  /**
   * @public
   * @returns {string}
   */
  getBothHandsContextResponse() {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsContextResponseAlert, {
      fitness: this.ratioDescriber.getRatioFitness()
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  getBothHandsObjectResponse() {
    const tickMarkView = this.tickMarkViewProperty.value;

    const leftPosition = this.handPositionsDescriber.getBothHandsHandPosition( this.numeratorProperty, tickMarkView );
    const rightPosition = this.handPositionsDescriber.getBothHandsHandPosition( this.denominatorProperty, tickMarkView );

    let position = null;
    if ( leftPosition === rightPosition ) {
      position = StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.equalObjectResponseAlert, {
        inPosition: leftPosition
      } );
    }
    else {
      position = StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.eachObjectResponseAlert, {
        leftPosition: leftPosition,
        rightPosition: rightPosition
      } );
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsObjectResponseAlert, {
      distance: this.handPositionsDescriber.getBothHandsDistance( tickMarkView ),
      position: position
    } );
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;