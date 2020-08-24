// Copyright 2020, University of Colorado Boulder

/**
 * Generates strings that describe motion of the free objects in this simulation. Provides a method to attach
 * to the end of drag input for the object which generates alert content and sends it to the simulation
 * utteranceQueue, see alertRatioChange.
 *
 * TODO: rename to RatioHalfAlertManager.js
 *
 * @author Jesse Greenberg
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';

class RatioAndProportionAlertManager {

  /**
   * @param {DerivedProperty.<number>} valueProperty
   * @param {RatioDescriber} ratioDescriber
   */
  constructor( valueProperty, ratioDescriber ) {

    // @private {RatioDescriber}
    this.ratioDescriber = ratioDescriber;

    // @private {DerivedProperty.<number>}
    this.valueProperty = valueProperty;

    // @private {number|null} - indexes point to the previous value that will change, only null on startup and reset
    // as there was no previous value
    this.describedRatioIndex = null;

    // @private {number} - reference to the last describe value so we can describe how it changes since last time, only
    // null on startup and reset since there was no described value
    this.previouslyDescribedValue = valueProperty.get();
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object and the subsequent change
   * in ratio. Use at the end of a user interaction.
   * @public
   *
   * @param {number} newValue
   */
  alertRatioChange( newValue ) {

    // TODO: why not get the same alert if you don't move it?
    if ( newValue !== this.previouslyDescribedValue ) {

      const nextRatioIndex = this.ratioDescriber.getRatioFitnessIndex();

      // if the ratio description changed
      if ( this.describedRatioIndex !== nextRatioIndex ) {
        phet.joist.sim.utteranceQueue.addToBack( this.ratioDescriber.getRatioDescriptionString() );
      }

      this.describedRatioIndex = nextRatioIndex;
      this.previouslyDescribedValue = newValue;
    }
  }


  /**
   * Reset state variables that help us describe changes after the end of an interaction.
   * @public
   */
  reset() {
    this.describedRatioIndex = null;

    this.previouslyDescribedValue = this.valueProperty.get();
  }
}

ratioAndProportion.register( 'RatioAndProportionAlertManager', RatioAndProportionAlertManager );

export default RatioAndProportionAlertManager;
