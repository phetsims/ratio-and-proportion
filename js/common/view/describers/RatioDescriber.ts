// Copyright 2020-2021, University of Colorado Boulder

/**
 * Class responsible for formulating description strings about the state of the ratio and its fitness.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import sceneryPhetStrings from '../../../../../scenery-phet/js/sceneryPhetStrings.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import rapConstants from '../../rapConstants.js';
import Property from '../../../../../axon/js/Property.js';
import RAPModel from '../../model/RAPModel.js';

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

const NUMBER_TO_WORD = [
  // @ts-ignore
  sceneryPhetStrings.zero,
  // @ts-ignore
  sceneryPhetStrings.one,
  // @ts-ignore
  sceneryPhetStrings.two,
  // @ts-ignore
  sceneryPhetStrings.three,
  // @ts-ignore
  sceneryPhetStrings.four,
  // @ts-ignore
  sceneryPhetStrings.five,
  // @ts-ignore
  sceneryPhetStrings.six,
  // @ts-ignore
  sceneryPhetStrings.seven,
  // @ts-ignore
  sceneryPhetStrings.eight,
  // @ts-ignore
  sceneryPhetStrings.nine,
  // @ts-ignore
  sceneryPhetStrings.ten
];

// an unclamped fitness of 0 should map to "somewhatCloseTo" region
const ZERO_FITNESS_REGION_INDEX = 4;

type LinearFunctionType = ( x: number ) => number;

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  private ratioFitnessProperty: Property<number>;
  private unclampedFitnessProperty: Property<number>;
  private model: RAPModel;

  /**
   * @param {RAPModel} model
   */
  constructor( model: RAPModel ) {

    // @private - from model
    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.unclampedFitnessProperty = model.unclampedFitnessProperty;
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

    // @ts-ignore
    assert && assert( ZERO_FITNESS_REGION_INDEX !== 0, 'should not be first index' );

    const lastIndex = RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE[ lastIndex ] === ratioAndProportionStrings.a11y.ratio.lowercase.at, 'There are assumptions made about the order of these regions, likely this should not change.' );

    const ratioRegions = capitalized ? RATIO_FITNESS_STRINGS_CAPITALIZED : RATIO_FITNESS_STRINGS_LOWERCASE;

    // hard coded region for in proportion
    if ( this.model.inProportionProperty.value ) {
      return ratioRegions[ lastIndex ];
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = rapConstants.RATIO_FITNESS_RANGE.max - this.model.getInProportionThreshold();

    const lessThanZeroMapping = <LinearFunctionType>( new LinearFunction( this.model.getMinFitness(), rapConstants.RATIO_FITNESS_RANGE.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true ) );
    const greaterThanZeroMapping = <LinearFunctionType>( new LinearFunction( rapConstants.RATIO_FITNESS_RANGE.min, normalizedMax,
      ZERO_FITNESS_REGION_INDEX, lastIndex, true ) );

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
  getCurrentChallengeSentence( antecedent: number, consequent: number ) {
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
  getTargetRatioChangeAlert( antecedent: number, consequent: number ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.targetRatioChangedContextResponse, {
      proximityToRatio: this.getProximityToNewChallengeRatioSentence(),
      currentChallenge: this.getCurrentChallengeSentence( antecedent, consequent )
    } );
  }

  /**
   * @public
   * @param {number} number
   * @returns {string}
   */
  getWordFromNumber( number: number ) {
    assert && assert( Number.isInteger( number ) );
    assert && assert( NUMBER_TO_WORD.length > number );
    return NUMBER_TO_WORD[ number ];
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;