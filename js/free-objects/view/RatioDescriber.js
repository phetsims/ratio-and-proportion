// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

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
const RATIO_FITNESS_STRINGS = [
  ratioAndProportionStrings.a11y.ratio.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.farFrom,
  ratioAndProportionStrings.a11y.ratio.notCloseTo,
  ratioAndProportionStrings.a11y.ratio.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.at
];

class RatioDescriber {

  /**
   * @param {FreeObjectsModel} model
   * @param {GridDescriber} gridDescriber
   */
  constructor( model, gridDescriber ) {

    // @private - from model
    this.proportionFitnessProperty = model.proportionFitnessProperty;
    this.leftValueProperty = model.leftValueProperty;
    this.rightValueProperty = model.rightValueProperty;
    this.valueRange = model.valueRange;
    this.proportionFitnessProperty = model.proportionFitnessProperty;
    this.fitnessRange = model.fitnessRange;

    // @private
    this.gridDescriber = gridDescriber;
  }

  /**
   * @public
   * @returns {string}
   */
  getLeftQualitativePointerPosition() {
    return this.getQualitativePointerPosition( this.leftValueProperty );
  }

  /**
   * @public
   * @returns {string}
   */
  getRightQualitativePointerPosition() {
    return this.getQualitativePointerPosition( this.rightValueProperty );
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
   * @public
   * @returns {{grid: number, relativePosition: string}}
   */
  getLeftQuantitativePositionObject() {
    return this.gridDescriber.getRelativePositionAndGridNumberForProperty( this.leftValueProperty );
  }

  /**
   * @public
   * @returns {{grid: number, relativePosition: string}}
   */
  getRightQuantitativePositionObject() {
    return this.gridDescriber.getRelativePositionAndGridNumberForProperty( this.rightValueProperty );
  }

  /**
   * @public
   * @returns {string}
   */
  getRatioFitness() {
    const normalizedFitness = ( this.proportionFitnessProperty.value - this.fitnessRange.min ) / this.fitnessRange.getLength();
    const index = Math.floor( normalizedFitness * ( RATIO_FITNESS_STRINGS.length - 1 ) );

    return RATIO_FITNESS_STRINGS[ index ];
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;