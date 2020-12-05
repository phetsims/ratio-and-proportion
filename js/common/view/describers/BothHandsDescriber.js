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
   * @param {Property.<number>} antecedentProperty
   * @param {Property.<number>} consequentProperty
   * @param {Property.<Range>} enabledRatioTermsRangeProperty
   * @param ratioLockedProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   */
  constructor( antecedentProperty, consequentProperty, enabledRatioTermsRangeProperty, ratioLockedProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber ) {

    // @private - from model
    this.antecedentProperty = antecedentProperty;
    this.consequentProperty = consequentProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioLockedProperty = ratioLockedProperty;
  }

  /**
   * @public
   * @returns {string}
   */
  getBothHandsContextResponse() {

    // only applicable if the ratio is locked
    const ratioLockedEdgeResponse = this.getRatioLockedEdgeCaseContextResponse();
    if ( ratioLockedEdgeResponse ) {
      return ratioLockedEdgeResponse;
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.bothHandsContextResponseAlert, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, true ),
      position: this.getBothHandsPosition()
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

    const leftPosition = this.handPositionsDescriber.getHandPositionDescription( this.antecedentProperty.value, tickMarkView, false );
    const rightPosition = this.handPositionsDescriber.getHandPositionDescription( this.consequentProperty.value, tickMarkView, false );

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
   * @returns {string}
   */
  getBothHandsObjectResponse() {
    return this.ratioDescriber.getProximityToChallengeRatio();
  }

  /**
   * Get the edge response when ratio is locked.
   * @private
   * @returns {string|null} - null if not in the edge case or the ratio is not locked
   */
  getRatioLockedEdgeCaseContextResponse() {

    if ( !this.ratioLockedProperty.value ) {
      return null;
    }

    const enabledRange = this.enabledRatioTermsRangeProperty.value;

    let handAtExtremity = null; // what hand?
    let extremityPosition = null; // where are we now?
    let direction = null; // where to go from here?

    if ( this.antecedentProperty.value === enabledRange.min ) {
      handAtExtremity = ratioAndProportionStrings.a11y.leftHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.nearBottom;
      direction = ratioAndProportionStrings.a11y.up;
    }
    else if ( this.antecedentProperty.value === enabledRange.max ) {
      handAtExtremity = ratioAndProportionStrings.a11y.leftHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
      direction = ratioAndProportionStrings.a11y.down;
    }
    else if ( this.consequentProperty.value === enabledRange.min ) {
      handAtExtremity = ratioAndProportionStrings.a11y.rightHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.nearBottom;
      direction = ratioAndProportionStrings.a11y.up;
    }
    else if ( this.consequentProperty.value === enabledRange.max ) {
      handAtExtremity = ratioAndProportionStrings.a11y.rightHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
      direction = ratioAndProportionStrings.a11y.down;
    }

    // Detect if we are at the edge of the range
    if ( handAtExtremity && extremityPosition && direction ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.ratioLockedEdgeContextResponse, {
        position: extremityPosition,
        hand: handAtExtremity,
        direction: direction
      } );
    }

    return null;
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;