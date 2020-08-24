// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../dot/js/LinearFunction.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import GridView from './GridView.js';

// constants
const QUALITATIVE_POSITIONS = [
  ratioAndProportionStrings.a11y.pointerPosition.atBottom,
  ratioAndProportionStrings.a11y.pointerPosition.nearBottom,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatNearBottom,
  ratioAndProportionStrings.a11y.pointerPosition.justBelowMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.atMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.justAboveMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatNearTop,
  ratioAndProportionStrings.a11y.pointerPosition.nearTop,
  ratioAndProportionStrings.a11y.pointerPosition.atTop
];
const RATIO_FITNESS_STRINGS_CAPITALIZED = [
  ratioAndProportionStrings.a11y.ratio.capitalized.extremelyFarFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.farFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.notCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.extremelyCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.at
];

const RATIO_FITNESS_STRINGS_LOWERCASE = [
  ratioAndProportionStrings.a11y.ratio.lowercase.extremelyFarFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.farFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.notCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.extremelyCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.at
];

// This arbitrary fitness value mapped a reasonable range for the regions.
const FITNESS_MIN_FOR_RATIO_REGIONS = -3;

// an unclamped fitness of 0 should map to "somewhatCloseTo" region
const ZERO_FITNESS_REGION_INDEX = 4;

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  /**
   * @param {RatioAndProportionModel} model
   * @param {GridDescriber} gridDescriber
   */
  constructor( model, gridDescriber ) {

    // @private - from model
    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.unclampedFitnessProperty = model.unclampedFitnessProperty;
    this.leftValueProperty = model.leftValueProperty;
    this.rightValueProperty = model.rightValueProperty;
    this.valueRange = model.valueRange;
    this.fitnessRange = model.fitnessRange;
    this.model = model;

    // @private
    this.gridDescriber = gridDescriber;
  }

  /**
   * @param {GridView} gridView
   * @returns {string}
   * @public
   */
  getBothHandsPositionText( gridView ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHandsValuetext, {
      leftPosition: this.getHandPosition( this.leftValueProperty, gridView ),
      rightPosition: this.getHandPosition( this.rightValueProperty, gridView )
    } );
  }

  /**
   * only ends with "of Play Area" if qualitative
   * @public
   * @param {NumberProperty} valueProperty
   * @param {GridView} gridView
   * @returns {string}
   */
  getHandPosition( valueProperty, gridView ) {
    if ( GridView.describeQualitative( gridView ) ) {

      return StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
        position: this.getQualitativePointerPosition( valueProperty )
      } );
    }
    else {
      return this.getQuantitativePointerPosition( valueProperty );
    }
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

    const normalizedPosition = this.valueRange.getNormalizedValue( position );

    if ( normalizedPosition === this.valueRange.max ) {
      return 8;
    }
    else if ( normalizedPosition >= .9 ) {
      return 7;
    }
    else if ( normalizedPosition > .7 ) {
      return 6;
    }
    else if ( normalizedPosition > .5 ) {
      return 5;
    }
    else if ( normalizedPosition === .5 ) {
      return 4;
    }
    else if ( normalizedPosition >= .4 ) {
      return 3;
    }
    else if ( normalizedPosition > .2 ) {
      return 2;
    }
    else if ( normalizedPosition > this.valueRange.min ) {
      return 1;
    }
    else if ( normalizedPosition === this.valueRange.min ) {
      return 0;
    }

    assert && assert( false, 'we should not get here' );
  }

  /**
   * Get an index for the current fitness of the ratio, relative to the number of possible fitness descriptions. Low
   * values are very far from the ratios and high values are closer to the ratio from 0 to RATIO_FITNESS_STRINGS_CAPITALIZED.length.
   * @public
   *
   * Design for ratio regions was solidified in https://github.com/phetsims/ratio-and-proportion/issues/137#issuecomment-676828657
   * In this comment, a subset of regions were set for <=0 fitness, and a subset were for >0.
   *
   * @returns {number}
   */
  getRatioFitnessIndex() {

    // hard coded region for in proportion
    // TODO: should this even be part of the list, perhaps it is a list of non-in-proportion regions. Not sure what's best.
    if ( this.model.inProportion() ) {
      return RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = this.fitnessRange.max - this.model.getInProportionThreshold();

    // account for excluding "in proportion" region above.
    const lessThanZeroMapping = new LinearFunction( FITNESS_MIN_FOR_RATIO_REGIONS, this.fitnessRange.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true );
    const greaterThanZeroMapping = new LinearFunction( this.fitnessRange.min, normalizedMax, ZERO_FITNESS_REGION_INDEX, RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1, true );

    const unclampedFitness = this.unclampedFitnessProperty.value;

    const mappingFuntion = unclampedFitness >= 0 ? greaterThanZeroMapping : lessThanZeroMapping;

    return Math.floor( mappingFuntion( unclampedFitness ) );
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
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.descriptionPattern, {
      fitness: this.getRatioFitness()
    } );
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;