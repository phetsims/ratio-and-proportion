// Copyright 2020, University of Colorado Boulder

// REVIEW: I (jbphet) don't know much about describers.  Would a description of what this is be useful, or is it obvious from the name what it does?
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
      phet.log( this.getRatioFitness( false ) );
    } );
  }

  /**
   * @public
   * @param {boolean} capitalized
   * @returns {string}
   */
  getRatioFitness( capitalized = true ) {
    assert && assert( ZERO_FITNESS_REGION_INDEX !== 0, 'should not be first index' );

    const lastIndex = RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE[ lastIndex ] === ratioAndProportionStrings.a11y.ratio.lowercase.at, 'There are assumptions made about the order of these regions, likely this should not change.' );

    const ratioRegions = capitalized ? RATIO_FITNESS_STRINGS_CAPITALIZED : RATIO_FITNESS_STRINGS_LOWERCASE;

    // hard coded region for in proportion
    if ( this.model.inProportion() ) {
      return ratioRegions[ lastIndex ];
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = this.fitnessRange.max - this.model.getInProportionThreshold();

    const lessThanZeroMapping = new LinearFunction( this.model.getMinFitness(), this.fitnessRange.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true );
    const greaterThanZeroMapping = new LinearFunction( this.fitnessRange.min, normalizedMax,
      ZERO_FITNESS_REGION_INDEX, lastIndex, true );

    const unclampedFitness = this.unclampedFitnessProperty.value;

    const mappingFunction = unclampedFitness > 0 ? greaterThanZeroMapping : lessThanZeroMapping;

    return ratioRegions[ Math.floor( mappingFunction( unclampedFitness ) ) ];
  }

  /**
   * @public
   * @returns {string}
   */
  getProximityToChallengeRatio() {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.proximityToRatioObjectResponse, {
      proximityToRatio: this.getRatioFitness( false )
    } );
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
   * @param {number} antecedent
   * @param {number} consequent
   * @returns {string}
   */
  getCurrentChallengeSentence( antecedent, consequent ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.currentChallenge, {
      targetAntecedent: antecedent,
      targetConsequent: consequent
    } );
  }

  /**
   * @public
   * @param {number} antecedent
   * @param {number} consequent
   * @returns {string}
   */
  getTargetRatioChangeAlert( antecedent, consequent ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.targetRatioChangedContextResponse, {
      proximityToRatio: this.getProximityToNewChallengeRatioSentence(),
      currentChallenge: this.getCurrentChallengeSentence( antecedent, consequent )
    } );
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;