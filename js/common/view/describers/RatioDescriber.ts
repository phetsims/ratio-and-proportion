// Copyright 2020-2022, University of Colorado Boulder

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
import RAPModel from '../../model/RAPModel.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';

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
  sceneryPhetStrings.zero,
  sceneryPhetStrings.one,
  sceneryPhetStrings.two,
  sceneryPhetStrings.three,
  sceneryPhetStrings.four,
  sceneryPhetStrings.five,
  sceneryPhetStrings.six,
  sceneryPhetStrings.seven,
  sceneryPhetStrings.eight,
  sceneryPhetStrings.nine,
  sceneryPhetStrings.ten
];

// an unclamped fitness of 0 should map to "somewhatCloseTo" region
const ZERO_FITNESS_REGION_INDEX = 4;

assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE.length === RATIO_FITNESS_STRINGS_CAPITALIZED.length, 'should be the same length' );

class RatioDescriber {

  private ratioFitnessProperty: TReadOnlyProperty<number>;
  private unclampedFitnessProperty: TReadOnlyProperty<number>;
  private model: RAPModel;

  public constructor( model: RAPModel ) {

    this.ratioFitnessProperty = model.ratioFitnessProperty;
    this.unclampedFitnessProperty = model.unclampedFitnessProperty;
    this.model = model;

    phet.log && model.unclampedFitnessProperty.link( () => {
      phet.log( this.getRatioFitness( false ) );
    } );
  }

  public getRatioFitness( capitalized = true ): string {

    const lastIndex = RATIO_FITNESS_STRINGS_CAPITALIZED.length - 1;
    assert && assert( RATIO_FITNESS_STRINGS_LOWERCASE[ lastIndex ] === ratioAndProportionStrings.a11y.ratio.lowercase.at, 'There are assumptions made about the order of these regions, likely this should not change.' );

    const ratioRegions = capitalized ? RATIO_FITNESS_STRINGS_CAPITALIZED : RATIO_FITNESS_STRINGS_LOWERCASE;

    // hard coded region for in proportion
    if ( this.model.inProportionProperty.value ) {
      return ratioRegions[ lastIndex ];
    }

    // normalize based on the fitness that is not in proportion
    const normalizedMax = rapConstants.RATIO_FITNESS_RANGE.max - this.model.getInProportionThreshold();

    const lessThanZeroMapping = new LinearFunction( this.model.getMinFitness(), rapConstants.RATIO_FITNESS_RANGE.min, 0, ZERO_FITNESS_REGION_INDEX - 1, true );
    const greaterThanZeroMapping = new LinearFunction( rapConstants.RATIO_FITNESS_RANGE.min, normalizedMax,
      ZERO_FITNESS_REGION_INDEX, lastIndex, true );

    const unclampedFitness = this.unclampedFitnessProperty.value;

    const mappingFunction = unclampedFitness > 0 ? greaterThanZeroMapping : lessThanZeroMapping;

    return ratioRegions[ Math.floor( mappingFunction.evaluate( unclampedFitness ) ) ];
  }

  public getProximityToChallengeRatio(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.proximityToRatioObjectResponse, {
      proximityToRatio: this.getRatioFitness( false )
    } );
  }

  public getProximityToNewChallengeRatioSentence(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.proximityToNewRatioPattern, {
      proximity: this.getRatioFitness( false )
    } );
  }

  public getCurrentChallengeSentence( antecedent: number, consequent: number ): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.currentChallenge, {

      // for consistency with all values, see https://github.com/phetsims/ratio-and-proportion/issues/283
      targetAntecedent: this.getWordFromNumber( antecedent ),
      targetConsequent: this.getWordFromNumber( consequent )
    } );
  }

  public getTargetRatioChangeAlert( antecedent: number, consequent: number ): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.targetRatioChangedContextResponse, {
      proximityToRatio: this.getProximityToNewChallengeRatioSentence(),
      currentChallenge: this.getCurrentChallengeSentence( antecedent, consequent )
    } );
  }

  public getWordFromNumber( number: number ): string {
    assert && assert( Number.isInteger( number ) );
    assert && assert( NUMBER_TO_WORD.length > number );
    return NUMBER_TO_WORD[ number ];
  }
}

ratioAndProportion.register( 'RatioDescriber', RatioDescriber );
export default RatioDescriber;