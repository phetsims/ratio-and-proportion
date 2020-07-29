// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import GridView from './GridView.js';

const ratioDescriptionPatternString = ratioAndProportionStrings.a11y.ratio.descriptionPattern;

// constants
const QUALITATIVE_POSITIONS = [
  ratioAndProportionStrings.a11y.pointerPosition.atTheBottom,
  ratioAndProportionStrings.a11y.pointerPosition.nearTheBottom,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatCloseToTheBottom,
  ratioAndProportionStrings.a11y.pointerPosition.inTheMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatCloseToTheTop,
  ratioAndProportionStrings.a11y.pointerPosition.nearTheTop,
  ratioAndProportionStrings.a11y.pointerPosition.atTheTop
];
const RATIO_FITNESS_STRINGS_CAPITALIZED = [
  ratioAndProportionStrings.a11y.ratio.capitalized.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.farFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.notCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.at
];

const RATIO_FITNESS_STRINGS_LOWERCASE = [
  ratioAndProportionStrings.a11y.ratio.lowercase.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.farFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.notCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.at
];

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  /**
   * @param {RatioAndProportionModel} model
   * @param {GridDescriber} gridDescriber
   */
  constructor( model, gridDescriber ) {

    // @private - from model
    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.leftValueProperty = model.leftValueProperty;
    this.rightValueProperty = model.rightValueProperty;
    this.valueRange = model.valueRange;
    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.fitnessRange = model.fitnessRange;

    // @private
    this.gridDescriber = gridDescriber;
  }

  /**
   * @public
   * @param {GridView} gridView
   * @returns {string}
   */
  getLeftAriaValuetext( gridView ) {
    return this.getHandPositionAriaValuetext( this.leftValueProperty, gridView );
  }

  /**
   * @public
   * @param {GridView} gridView
   * @returns {string}
   */
  getRightAriaValuetext( gridView ) {
    return this.getHandPositionAriaValuetext( this.rightValueProperty, gridView );
  }

  /**
   * @private
   * @param {NumberProperty} valueProperty
   * @param {GridView} gridView
   * @returns {string}
   */
  getHandPositionAriaValuetext( valueProperty, gridView ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
      position: this.getHandPosition( valueProperty, gridView )
    } );
  }

  /**
   * @private
   * @param {NumberProperty} valueProperty
   * @param {GridView} gridView
   * @returns {string}
   */
  getHandPosition( valueProperty, gridView ) {
    return GridView.describeQualitative( gridView ) ? this.getQualitativePointerPosition( valueProperty ) :
           this.getQuantitativePointerPosition( valueProperty );
  }

  /**
   * @private
   * @param {NumberProperty} valueProperty
   * @returns {string}
   */
  getQuantitativePointerPosition( valueProperty ) {
    const gridObject = this.gridDescriber.getRelativePositionAndGridNumberForProperty( valueProperty );
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.grid.quantitativeHandPositionPattern, {
      relativePosition: gridObject.relativePosition,
      gridPosition: gridObject.gridPosition
    } );
  }

  /**
   * @private
   * @param {Property.<number>} property
   * @returns {string}
   */
  getQualitativePointerPosition( property ) {
    return QUALITATIVE_POSITIONS[ this.getQualitativePositionIndex( property.value ) ];
  }

  /**
   * @param {number} position - within this.valueRange
   * @returns {number}
   * @public
   */
  getQualitativePositionIndex( position ) {
    assert && assert( this.valueRange.contains( position ), 'position expected to be in valueRange' );

    if ( position === this.valueRange.min ) {
      return 0;
    }
    else if ( position === this.valueRange.max ) {
      return QUALITATIVE_POSITIONS.length - 1;
    }
    else {

      // TODO: support this based on this.valueRange
      // Get the length without counting the first or last
      const stringsWithoutExtremeties = QUALITATIVE_POSITIONS.length - 2;
      for ( let i = 1; i <= stringsWithoutExtremeties; i++ ) {
        if ( position < i * ( 1 / stringsWithoutExtremeties ) ) {
          return i;
        }
      }
      assert && assert( false, 'we should not get here' );
    }
  }

  /**
   * Get an index for the current fitness of the ratio, relative to the number of possible fitness descriptions. Low
   * values are very far from the ratios and high values are closer to the ratio from 0 to RATIO_FITNESS_STRINGS_CAPITALIZED.length.
   * @public
   *
   * @returns {number}
   */
  getRatioFitnessIndex() {
    const normalizedFitness = ( this.ratioFitnessProperty.value - this.fitnessRange.min ) / this.fitnessRange.getLength();
    return Math.floor( normalizedFitness * ( RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1 ) );
  }

  /**
   * @public
   * @returns {string}
   */
  getRatioFitness( capitalized = true ) {
    const ratioRegions = capitalized ? RATIO_FITNESS_STRINGS_CAPITALIZED : RATIO_FITNESS_STRINGS_LOWERCASE;
    return ratioRegions[ this.getRatioFitnessIndex() ];
  }

  /**
   * Get a description of the current ratio. Returns something like
   * "At ratio." or
   * "Very far from ratio."
   * @public
   */
  getRatioDescriptionString() {
    return StringUtils.fillIn( ratioDescriptionPatternString, {
      fitness: this.getRatioFitness()
    } );
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;