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
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

const leftHandString = ratioAndProportionStrings.a11y.leftHand;
const rightHandString = ratioAndProportionStrings.a11y.rightHand;

class RatioAndProportionAlertManager {

  /**
   * @param {DerivedProperty.<number>} valueProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {boolean} isRight - right or left object?
   */
  constructor( valueProperty, gridViewProperty, ratioDescriber, isRight ) {

    // @private {RatioDescriber}
    this.ratioDescriber = ratioDescriber;

    // @private {Property.<GridView>}
    this.gridViewProperty = gridViewProperty;

    // @private {boolean}
    this.isRight = isRight;

    // @private {DerivedProperty.<number>}
    this.valueProperty = valueProperty;

    // @private {string}
    this.objectString = this.isRight ? rightHandString : leftHandString;

    // @private {number|null} - indexes point to the previous value that will change, only null on startup and reset
    // as there was no previous value
    this.describedRatioIndex = null;

    // @private {boolean}
    this.firstMovementUp = true;
    this.firstMovementDown = true;

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

    this.firstMovementUp = true;
    this.firstMovementDown = true;

    this.previouslyDescribedValue = this.valueProperty.get();
  }
}

ratioAndProportion.register( 'RatioAndProportionAlertManager', RatioAndProportionAlertManager );

export default RatioAndProportionAlertManager;
