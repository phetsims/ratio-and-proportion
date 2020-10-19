// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';

// constants
const RATIO_FITNESS_STRINGS_CAPITALIZED = [
  ratioAndProportionStrings.a11y.ratio.capitalized.extremelyFarFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.farFrom,
  ratioAndProportionStrings.a11y.ratio.capitalized.notSoCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.extremelyCloseTo,
  ratioAndProportionStrings.a11y.ratio.capitalized.at
];

const RATIO_FITNESS_STRINGS_LOWERCASE = [
  ratioAndProportionStrings.a11y.ratio.lowercase.extremelyFarFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.veryFarFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.farFrom,
  ratioAndProportionStrings.a11y.ratio.lowercase.notSoCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.somewhatCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.veryCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.extremelyCloseTo,
  ratioAndProportionStrings.a11y.ratio.lowercase.at
];

// an unclamped fitness of 0 should map to "somewhatCloseTo" region
const ZERO_FITNESS_REGION_INDEX = 4;

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  /**
   * @param {RAPModel} model
   */
  constructor( model ) {

    // @private - from model
    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.unclampedFitnessProperty = model.unclampedFitnessProperty;
    this.fitnessRange = model.fitnessRange;
    this.model = model;

    phet.log && model.unclampedFitnessProperty.link( () => {
      phet.log( RATIO_FITNESS_STRINGS_LOWERCASE[ this.getRatioFitnessIndex() ] );
    } );
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
    assert && assert( ZERO_FITNESS_REGION_INDEX !== 0, 'should not be first index' );

    // hard coded region for in proportion
    // TODO: should this even be part of the list, perhaps it is a list of non-in-proportion regions. Not sure what's best.
    if ( this.model.inProportion() ) {
      return RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = this.fitnessRange.max - this.model.getInProportionThreshold();

    const lessThanZeroMapping = new LinearFunction( this.model.getMinFitness(), this.fitnessRange.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true );
    const greaterThanZeroMapping = new LinearFunction( this.fitnessRange.min, normalizedMax,
      ZERO_FITNESS_REGION_INDEX, RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1, true );

    const unclampedFitness = this.unclampedFitnessProperty.value;

    const mappingFuntion = unclampedFitness > 0 ? greaterThanZeroMapping : lessThanZeroMapping;

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
   * @public
   * @returns {string}
   */
  getProximityToNewChallengeRatioSentence() {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.proximityToNewRatioPattern, {
      proximity: this.getRatioFitness( false )
    } );
  }

  /**
   * @public
   * @param {number} numerator
   * @param {number} denominator
   * @returns {string}
   */
  getCurrentChallengeSentence( numerator, denominator ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.currentChallenge, {
      targetNumerator: numerator,
      targetDenominator: denominator
    } );
  }

  /**
   * @public
   * @param {number} numerator
   * @param {number} denominator
   * @returns {string}
   */
  getTargetRatioChangeAlert( numerator, denominator ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.targetRatioChangedContextResponse, {
      proximityToRatio: this.getProximityToNewChallengeRatioSentence(),
      currentChallenge: this.getCurrentChallengeSentence( numerator, denominator )
    } );
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;