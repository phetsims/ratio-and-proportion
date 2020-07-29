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

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MovementDescriber from '../../../../scenery-phet/js/accessibility/describers/MovementDescriber.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

const leftHandString = ratioAndProportionStrings.a11y.leftHand;
const rightHandString = ratioAndProportionStrings.a11y.rightHand;
const firstMovementAlertPatternString = ratioAndProportionStrings.a11y.pointerPosition.firstMovementAlertPattern;
const movementAlertWithChangePatternString = ratioAndProportionStrings.a11y.pointerPosition.movementAlertWithChangePattern;

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
      let alert = null;

      const nextRatioIndex = this.ratioDescriber.getRatioFitnessIndex();

      const changeDescription = this.getChangeInRatioDescription( newValue );
      const movingUp = newValue > this.previouslyDescribedValue;
      const directionDescription = MovementDescriber.getDirectionDescriptionFromAngle( movingUp ? -Math.PI / 2 : Math.PI / 2 );

      if ( movingUp && this.firstMovementUp ) {
        this.firstMovementUp = false;
        alert = this.getFirstMovementDescription( changeDescription, directionDescription );
      }
      else if ( !movingUp && this.firstMovementDown ) {
        this.firstMovementDown = false;
        alert = this.getFirstMovementDescription( changeDescription, directionDescription );

      }
      else {

        // if no other information, describe direction of movement only
        alert = changeDescription || directionDescription;
      }

      // Alert if we've got one.
      alert && phet.joist.sim.utteranceQueue.addToBack( alert );

      this.describedRatioIndex = nextRatioIndex;
      this.previouslyDescribedValue = newValue;
    }
  }

  /**
   * Get the first description of movement for an object. The description for actual movement is more verbose this
   * first time. After this, movement alerts are shorter until reset. If there was any change in state (ratio, region)
   * that will be part of this movement description.
   *
   * @param {string} changeDescription
   * @param directionDescription
   * @returns {string}
   * @private
   */
  getFirstMovementDescription( changeDescription, directionDescription ) {
    let alert;

    const movementAlert = StringUtils.fillIn( firstMovementAlertPatternString, {
      object: this.objectString,
      direction: directionDescription
    } );

    if ( changeDescription ) {
      alert = StringUtils.fillIn( movementAlertWithChangePatternString, {
        movementAlert: movementAlert,
        change: changeDescription
      } );
    }
    else {
      alert = movementAlert;
    }

    return alert;
  }

  /**
   * Get a description of changes for the object in response to movement from interaction. Will describe
   * If none of those have changed since the last description null is returned and no change in state should be described.
   *
   * @private
   * @param {number} newValue
   * @returns {null|string} - null if there is no change in ratio description
   */
  getChangeInRatioDescription( newValue ) {
    const nextRatioIndex = this.ratioDescriber.getRatioFitnessIndex();

    // if the ratio description changed
    if ( this.describedRatioIndex !== nextRatioIndex ) {
      return this.ratioDescriber.getRatioDescriptionString();
    }

    return null;
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
