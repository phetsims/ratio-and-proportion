// Copyright 2020, University of Colorado Boulder

/**
 * Generates strings that describe motion of the free objects in this simulation. Provides a method to attach
 * to the end of drag input for the object which generates alert content and sends it to the simulation
 * utteranceQueue, see alertRatioChange.
 *
 * @author Jesse Greenberg
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class RatioHalfAlertManager {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {BothHandsDescriber} bothHandsDescriber
   * @param {BooleanProperty} ratioLockedProperty
   */
  constructor( valueProperty, tickMarkViewProperty, ratioDescriber, handPositionsDescriber, bothHandsDescriber, ratioLockedProperty ) {

    // @private
    this.ratioDescriber = ratioDescriber; // {RatioDescriber}
    this.handPositionsDescriber = handPositionsDescriber; // {HandPositionsDescriber}
    this.bothHandsDescriber = bothHandsDescriber; // {BothHandsDescriber}
    this.ratioLockedProperty = ratioLockedProperty; // {BooleanProperty}
    this.tickMarkViewProperty = tickMarkViewProperty;

    // @private {Property.<number>}
    this.valueProperty = valueProperty;
  }

  /**
   * When the ratio is locked, the object response for individual hands changes, and instead explains the quality of the
   * ratio
   * @returns {string}
   * @public
   */
  getSingleHandRatioLockedObjectResponse() {
    return this.ratioDescriber.getProximityToChallengeRatio();
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object and the subsequent change
   * in ratio. This is the context response for the individual ratio half hand (slider) interaction.
   * @public
   * @returns {null|string} - null means no alert will occur
   */
  getSingleHandContextResponse() {

    // When locked, give a description of both-hands, instead of just a single one.
    if ( this.ratioLockedProperty.value ) {
      return this.bothHandsDescriber.getBothHandsContextResponse();
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.singleHandContextResponse, {
      distanceOrDistanceProgress: this.handPositionsDescriber.getDistanceClauseForProperty( this.valueProperty ),
      position: this.handPositionsDescriber.getHandPositionDescription( this.valueProperty.value, this.tickMarkViewProperty.value, false )
    } );
  }
}

ratioAndProportion.register( 'RatioHalfAlertManager', RatioHalfAlertManager );

export default RatioHalfAlertManager;
