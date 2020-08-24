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
    const normalizedFitness = ( this.ratioFitnessProperty.value - this.fitnessRange.min ) /
                              ( normalizedMax - this.fitnessRange.min );

    // don't count the "at" region
    return Math.floor( normalizedFitness * ( RATIO_FITNESS_STRINGS_CAPITALIZED.length - 2 ) );
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