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
  getBothHandsContextResponse( ratioLocked ) {
    if ( ratioLocked ) {
      return this.getRatioLockedContextResponse( this.numeratorProperty, this.tickMarkViewProperty.value );
    }
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsContextResponseAlert, {
      fitness: this.ratioDescriber.getRatioFitness()
    } );
  }

  /**
   * When each hand in different region, "left hand . . . , right hand . . ." otherwise "both hands . . ."
   * Used for both hands interaction, and with individual hands when the ratio is locked
   * @public
   * @returns {string}
   */
  getBothHandsPosition() {
    const tickMarkView = this.tickMarkViewProperty.value;

    const leftPosition = this.handPositionsDescriber.getBothHandsHandDescription( this.numeratorProperty.value, tickMarkView );
    const rightPosition = this.handPositionsDescriber.getBothHandsHandDescription( this.denominatorProperty.value, tickMarkView );

    if ( leftPosition === rightPosition ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.equalObjectResponseAlert, {
        inPosition: leftPosition
      } );
    }
    else {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.eachObjectResponseAlert, {
        leftPosition: leftPosition,
        rightPosition: rightPosition
      } );
    }
  }

  /**
   * @public
   * @param {TickMarkView} tickMarkView
   * @param {boolean} ratioLocked - if the ratio is locked
   * @returns {string}
   */
  getBothHandsObjectResponse( tickMarkView, ratioLocked ) {

    if ( ratioLocked ) {
      return this.getRatioLockedObjectResponse();
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsObjectResponseAlert, {
      distance: this.handPositionsDescriber.getBothHandsDistance( tickMarkView ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  getRatioLockedObjectResponse() {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.proximityToRatioObjectResponse, {
      proximityToRatio: this.ratioDescriber.getRatioFitness( false )
    } );
  }

  /**
   * A consistent context response for when interacting with the ratio
   * @param {Property.<number>} valueProperty
   * @param {TickMarkView} tickMarkView
   * @returns {string}
   * @public
   */
  getRatioLockedContextResponse( valueProperty, tickMarkView ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.singleHandRatioLockedContextResponse, {
      bothHandsRegion: this.getBothHandsPosition(),
      distanceOrDirection: this.handPositionsDescriber.getBothHandsDistanceOrDirection( valueProperty, tickMarkView, true )
    } );
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;