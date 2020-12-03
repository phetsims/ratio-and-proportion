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
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   */
  constructor( antecedentProperty, consequentProperty, enabledRatioTermsRangeProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber ) {

    // @private - from model
    this.antecedentProperty = antecedentProperty;
    this.consequentProperty = consequentProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
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
      return this.getRatioLockedContextResponse( this.antecedentProperty, this.tickMarkViewProperty.value );
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
   * Get the edge response when ratio is locked.
   * @private
   * @returns {string|null} - null if not in the edge case
   */
  getRatioLockedEdgeCaseContextResponse() {
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

  /**
   * A consistent context response for when interacting with the ratio
   * @param {Property.<number>} valueProperty
   * @param {TickMarkView} tickMarkView
   * @returns {string}
   * @public
   */
  getRatioLockedContextResponse( valueProperty, tickMarkView ) {

    const ratioLockedEdgeResponse = this.getRatioLockedEdgeCaseContextResponse();
    if ( ratioLockedEdgeResponse ) {
      return ratioLockedEdgeResponse;
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.singleHandRatioLockedContextResponse, {
      bothHandsRegion: this.getBothHandsPosition(),
      distanceOrDirection: this.handPositionsDescriber.getBothHandsDistanceOrDirection( valueProperty, tickMarkView, true )
    } );
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;