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
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param bothHandsDescriber
   * @param ratioLockedProperty
   */
  constructor( valueProperty, ratioDescriber, handPositionsDescriber, bothHandsDescriber, ratioLockedProperty ) {

    // @private
    this.ratioDescriber = ratioDescriber; // {RatioDescriber}
    this.handPositionsDescriber = handPositionsDescriber; // {HandPositionsDescriber}
    this.bothHandsDescriber = bothHandsDescriber; // {BothHandsDescriber}
    this.ratioLockedProperty = ratioLockedProperty; // {BooleanProperty}

    // @private {Property.<number>}
    this.valueProperty = valueProperty;

    // @private {number} - reference to the last describe value so we can describe how it changes since last time, only
    // null on startup and reset since there was no described value
    this.previousRatioAlertText = this.getRatioChangeAlert();
  }

  /**
   * @private
   * @returns {string}
   */
  getRatioChangeAlert() {

    // When locked, treat the alert like a "Both hands" interaction alert
    // TODO: we lost left/right hand behavior here. https://github.com/phetsims/ratio-and-proportion/issues/207
    if ( this.ratioLockedProperty.value ) {
      return this.bothHandsDescriber.getBothHandsContextResponse();
    }
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.singleHandContextResponse, {
      distanceOrDirection: this.handPositionsDescriber.getDistanceClauseForProperty( this.valueProperty ),
      proximityToRatio: this.ratioDescriber.getRatioFitness( false )
    } );
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object and the subsequent change
   * in ratio. Use at the end of a user interaction.
   * @public
   *
   */
  alertRatioChange() {
    const newAlert = this.getRatioChangeAlert();

    if ( newAlert !== this.previousRatioAlertText ) {

      phet.joist.sim.utteranceQueue.addToBack( newAlert );

      this.previousRatioAlertText = newAlert;
    }
  }


  /**
   * Reset state variables that help us describe changes after the end of an interaction.
   * @public
   */
  reset() {
    this.previousRatioAlertText = this.getRatioChangeAlert();
  }
}

ratioAndProportion.register( 'RatioHalfAlertManager', RatioHalfAlertManager );

export default RatioHalfAlertManager;
