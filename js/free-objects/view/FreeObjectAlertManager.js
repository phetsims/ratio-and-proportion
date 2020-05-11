// Copyright 2020, University of Colorado Boulder

/**
 * Generates strings that describe motion of the free objects in this simulation. Provides a method to attach
 * to the end of drag input for the object which generates alert content and sends it to the simulation
 * utteranceQueue, see dragEndListener.
 *
 * @author Jesse Greenberg
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MovementDescriber from '../../../../scenery-phet/js/accessibility/describers/MovementDescriber.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import GridView from './GridView.js';

const qualitativeAlertPatternString = ratioAndProportionStrings.a11y.pointerPosition.qualitativeAlertPattern;
const quantitativeAlertPatternString = ratioAndProportionStrings.a11y.pointerPosition.quantitativeAlertPattern;
const leftHandString = ratioAndProportionStrings.a11y.leftHand;
const rightHandString = ratioAndProportionStrings.a11y.rightHand;
const firstMovementAlertPatternString = ratioAndProportionStrings.a11y.pointerPosition.firstMovementAlertPattern;
const movementAlertWithChangePatternString = ratioAndProportionStrings.a11y.pointerPosition.movementAlertWithChangePattern;

class FreeObjectAlertManager {

  /**
   * @param {DerivedProperty.<number>} valueProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {GridDescriber} gridDescriber
   * @param {boolean} isRight - right or left object?
   */
  constructor( valueProperty, gridViewProperty, ratioDescriber, gridDescriber, isRight ) {

    // @private {RatioDescriber}
    this.ratioDescriber = ratioDescriber;

    // @private {GridDescriber}
    this.gridDescriber = gridDescriber;

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
    this.describedQualitativeRegionIndex = null;
    this.describedQuantitativeRegionIndex = null;

    // @private {boolean}
    this.firstMovementUp = true;
    this.firstMovementDown = true;

    // @private {number} - reference to the last describe value so we can describe how it changes since last time, only
    // null on startup and reset since there was no described value
    this.describedValue = valueProperty.get();
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object. Use at the
   * end of a drag interaction.
   * @public
   *
   * @param newValue
   */
  dragEndListener( newValue ) {
    if ( newValue !== this.describedValue ) {
      let alert = null;

      const nextQualitativeRegionIndex = this.ratioDescriber.getQualitativePositionIndex( newValue );
      const nextQuantitativeRegionIndex = this.gridDescriber.getFlooredGridPosition( newValue );
      const nextRatioIndex = this.ratioDescriber.getRatioFitnessIndex();

      const changeDescription = this.getChangeDescription( newValue );
      const movingUp = newValue > this.describedValue;
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
        if ( changeDescription ) {
          alert = changeDescription;
        }
        else {

          // if no other information, describe direction of movement only
          alert = directionDescription;
        }
      }

      if ( alert ) {
        phet.joist.sim.utteranceQueue.addToBack( alert );
      }

      this.describedRatioIndex = nextRatioIndex;
      this.describedQualitativeRegionIndex = nextQualitativeRegionIndex;
      this.describedQuantitativeRegionIndex = nextQuantitativeRegionIndex;
      this.describedValue = newValue;
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
   * Get a description of changes for the object in response to movement from a drag interaction. Will describe
   * any changes to the qualitative region, quantitative grid value, or ratio with other hand position. If none
   * of those have changed since the last description null is returned and no change in state should be described.
   *
   * @private
   * @param {number} newValue
   * @returns {null|string}
   */
  getChangeDescription( newValue ) {
    let description = null;

    const nextQualitativeRegionIndex = this.ratioDescriber.getQualitativePositionIndex( newValue );
    const nextQuantitativeRegionIndex = this.gridDescriber.getFlooredGridPosition( newValue );
    const nextRatioIndex = this.ratioDescriber.getRatioFitnessIndex();

    const ratioChanged = this.describedRatioIndex !== nextRatioIndex;
    const qualitativeRegionChanged = this.describedQualitativeRegionIndex !== nextQualitativeRegionIndex;
    const quantitativeRegionChanged = this.describedQuantitativeRegionIndex !== nextQuantitativeRegionIndex;

    const describingQualitative = GridView.describeQualitative( this.gridViewProperty.value );

    // TODO: Better way? 3 is very arbitrary and requires knowledge of contents about RATIO_FITNESS_STRINGS
    if ( ratioChanged && nextRatioIndex >= 3 ) {

      // only describe the ratio if we get close to it
      description = this.ratioDescriber.getRatioDescriptionString();
    }
    else if ( describingQualitative && qualitativeRegionChanged ) {
      description = StringUtils.fillIn( qualitativeAlertPatternString, {
        object: this.objectString,
        position: this.ratioDescriber.getQualitativePointerPosition( this.valueProperty )
      } );
    }
    else if ( !describingQualitative && quantitativeRegionChanged ) {
      description = StringUtils.fillIn( quantitativeAlertPatternString, {
        value: this.gridDescriber.getFlooredGridPosition( newValue )
      } );
    }

    return description;
  }

  /**
   * Reset state variables that help us describe changes after the end of an interaction.
   * @public
   */
  reset() {
    this.describedRatioIndex = null;
    this.describedQualitativeRegionIndex = null;
    this.describedQuantitativeRegionIndex = null;

    this.firstMovementUp = true;
    this.firstMovementDown = true;

    this.describedValue = this.valueProperty.get();
  }
}

ratioAndProportion.register( 'FreeObjectAlertManager', FreeObjectAlertManager );

export default FreeObjectAlertManager;
