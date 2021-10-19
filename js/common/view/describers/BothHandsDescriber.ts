// Copyright 2020, University of Colorado Boulder

/**
 * Class responsible for formulating description strings specific to the both-hands interaction and associated
 * description (like in the screen summary and PDOMNode).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';

const ratioDistancePositionContextResponsePatternString = ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse;

class BothHandsDescriber {

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Property.<Range>} enabledRatioTermsRangeProperty
   * @param ratioLockedProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   */
  constructor( ratioTupleProperty, enabledRatioTermsRangeProperty, ratioLockedProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber ) {

    // @private - from model
    this.ratioTupleProperty = ratioTupleProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioLockedProperty = ratioLockedProperty;

    // @private - keep track of previous values at edge to make sure we only give edge alerts after we have already arrived, see https://github.com/phetsims/ratio-and-proportion/issues/247
    this.previousAntecedentAtExtremity = false;
    this.previousConsequentAtExtremity = false;
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

    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternString, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, true ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * Similar to getBothHandsContextResponse, but without extra logic for edges and distance-progress.
   * @public
   * @returns {string}
   */
  getBothHandsDynamicDescription() {
    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternString, {
      distance: this.handPositionsDescriber.getBothHandsDistance( false, true ),
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

    const currentTuple = this.ratioTupleProperty.value;
    const leftPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.antecedent, tickMarkView, false );
    const rightPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.consequent, tickMarkView, false );

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

    if ( this.ratioTupleProperty.value.antecedent === enabledRange.min ) {
      if ( this.previousAntecedentAtExtremity ) {
        handAtExtremity = ratioAndProportionStrings.a11y.leftHand;
        extremityPosition = ratioAndProportionStrings.a11y.handPosition.nearBottom;
        direction = ratioAndProportionStrings.a11y.up;
      }
      else {
        this.previousAntecedentAtExtremity = true;
      }
    }
    else if ( this.ratioTupleProperty.value.antecedent === enabledRange.max ) {
      if ( this.previousAntecedentAtExtremity ) {
        handAtExtremity = ratioAndProportionStrings.a11y.leftHand;
        extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
        direction = ratioAndProportionStrings.a11y.down;
      }
      else {
        this.previousAntecedentAtExtremity = true;
      }
    }
    else if ( this.ratioTupleProperty.value.consequent === enabledRange.min ) {
      if ( this.previousConsequentAtExtremity ) {
        handAtExtremity = ratioAndProportionStrings.a11y.rightHand;
        extremityPosition = ratioAndProportionStrings.a11y.handPosition.nearBottom;
        direction = ratioAndProportionStrings.a11y.up;
      }
      else {
        this.previousConsequentAtExtremity = true;
      }
    }
    else if ( this.ratioTupleProperty.value.consequent === enabledRange.max ) {
      if ( this.previousConsequentAtExtremity ) {
        handAtExtremity = ratioAndProportionStrings.a11y.rightHand;
        extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
        direction = ratioAndProportionStrings.a11y.down;
      }
      else {
        this.previousConsequentAtExtremity = true;
      }
    }
    else {
      this.previousAntecedentAtExtremity = false;
      this.previousConsequentAtExtremity = false;
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

  /**
   * @public
   */
  reset() {
    this.previousAntecedentAtExtremity = false;
    this.previousConsequentAtExtremity = false;
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;