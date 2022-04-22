// Copyright 2020-2022, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship like the distance between each
 * hand, and if they have gotten closer to or farther from each other ("distance progress").
 *
 * In general, responses are split into implementaiton based on the DistanceResponseType. Whether it be distance
 * region (qualitative regions), distance progress (closer/farther), or a combo algorithm to default to distance region,
 * but you distance progress to prevent repeating the same region many times.
 *
 * `getSingleHandContextResponse` and `getBothHandsDistance` use a similar algorithm to accomplish these variations, but
 * could not be factored out completely due to natural language requirements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../../../dot/js/Range.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import RatioTerm from '../../model/RatioTerm.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';
import Property from '../../../../../axon/js/Property.js';
import RAPRatioTuple from '../../model/RAPRatioTuple.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import IReadOnlyProperty from '../../../../../axon/js/IReadOnlyProperty.js';
import DistanceResponseType from './DistanceResponseType.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import RatioInputModality from './RatioInputModality.js';

const leftHandLowerString = ratioAndProportionStrings.a11y.leftHandLower;
const rightHandLowerString = ratioAndProportionStrings.a11y.rightHandLower;

const DISTANCE_REGIONS_CAPITALIZED = [
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.farthestFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.veryFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.farFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.notSoCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.somewhatCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.veryCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.almostEvenWith,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.evenWith
];

const DISTANCE_REGIONS_LOWERCASE = [
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.farthestFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.extremelyFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.veryFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.farFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.notSoCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.somewhatCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.veryCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.extremelyCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.almostEvenWith,
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.evenWith
];

assert && assert( DISTANCE_REGIONS_CAPITALIZED.length === DISTANCE_REGIONS_LOWERCASE.length, 'should be the same regions' );

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

// Empirically determined to fix edge case described in https://github.com/phetsims/ratio-and-proportion/issues/437
const aroundMiddleRegionWidth = 0.0025;

class PositionRegionsData {
  lowerBound: number;
  private inRegionPredicate: ( inputValue: number, lowerBound: number ) => boolean;
  region: string;

  constructor( lowerBound: number, inRegionPredicate: PositionRegionsData['inRegionPredicate'], region: string ) {
    this.lowerBound = lowerBound;
    this.inRegionPredicate = inRegionPredicate;
    this.region = region;
  }

  positionInRegion( position: number ): boolean {
    return this.inRegionPredicate( position, this.lowerBound );
  }
}

// Order matters! The first predicate must be run before the second for each to work correctly at identifying their
// own region. This is because each PositionRegionsData works based solely on a lowerBound.
const POSITION_REGIONS_DATA: PositionRegionsData[] = [
  new PositionRegionsData( 1, ( position, lowerBound ) => position === lowerBound,
    ratioAndProportionStrings.a11y.handPosition.atTop ),
  new PositionRegionsData( 0.9, ( position, lowerBound ) => position >= lowerBound,
    ratioAndProportionStrings.a11y.handPosition.nearTop ),
  new PositionRegionsData( 0.65, ( position, lowerBound ) => position > lowerBound,
    ratioAndProportionStrings.a11y.handPosition.inUpperRegion ),
  new PositionRegionsData( 0.5 + aroundMiddleRegionWidth, ( position, lowerBound ) => position > lowerBound,
    ratioAndProportionStrings.a11y.handPosition.inUpperMiddleRegion ),
  new PositionRegionsData( 0.5, ( position, lowerBound ) => position > lowerBound,
    ratioAndProportionStrings.a11y.handPosition.aroundMiddle ),
  new PositionRegionsData( 0.5, ( position, lowerBound ) => position === lowerBound,
    ratioAndProportionStrings.a11y.handPosition.atMiddle ),
  new PositionRegionsData( 0.5 - aroundMiddleRegionWidth, ( position, lowerBound ) => position >= lowerBound,
    ratioAndProportionStrings.a11y.handPosition.aroundMiddle ),
  new PositionRegionsData( 0.35, ( position, lowerBound ) => position >= lowerBound,
    ratioAndProportionStrings.a11y.handPosition.inLowerMiddleRegion ),
  new PositionRegionsData( 0.1, ( position, lowerBound ) => position > lowerBound,
    ratioAndProportionStrings.a11y.handPosition.inLowerRegion ),
  new PositionRegionsData( 0, ( position, lowerBound ) => position > lowerBound,
    ratioAndProportionStrings.a11y.handPosition.nearBottom ),
  new PositionRegionsData( 0, ( position, lowerBound ) => position === lowerBound,
    ratioAndProportionStrings.a11y.handPosition.atBottom )
];

type GetDistanceProgressStringOptions = {

  // set to false if it is desired to get distanceProgress even when in proportion
  inProportionOverridesDistanceProgress?: boolean;
  closerString?: string;
  fartherString?: string;
};

export type HandContextResponseOptions = {
  distanceResponseType?: DistanceResponseType;
};

class HandPositionsDescriber {

  private ratioTupleProperty: Property<RAPRatioTuple>;
  private tickMarkDescriber: TickMarkDescriber;
  private inProportionProperty: IReadOnlyProperty<boolean>;
  private ratioLockedProperty: IReadOnlyProperty<boolean>;

  // keep track of previous distance regions to track repetition, and alter description accordingly. This
  // is used for any modality getting a distance region in a context response.
  private previousDistanceRegionSingle: null | string;
  private previousDistanceRegionBoth: null | string;

  private previousDistance: number;
  static POSITION_REGIONS_DATA: PositionRegionsData[];
  private previousEdgeCheckTuple: RAPRatioTuple;
  enabledRatioTermsRangeProperty: IReadOnlyProperty<Range>;

  constructor( ratioTupleProperty: Property<RAPRatioTuple>, tickMarkDescriber: TickMarkDescriber,
               inProportionProperty: IReadOnlyProperty<boolean>, enabledRatioTermsRangeProperty: IReadOnlyProperty<Range>,
               ratioLockedProperty: IReadOnlyProperty<boolean> ) {

    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioLockedProperty = ratioLockedProperty;
    this.tickMarkDescriber = tickMarkDescriber;
    this.inProportionProperty = inProportionProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;

    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = ratioTupleProperty.value.getDistance();

    this.previousEdgeCheckTuple = ratioTupleProperty.value;

    ratioTupleProperty.lazyLink( ( newValue, oldValue ) => {
      if ( oldValue ) {
        this.previousDistance = oldValue.getDistance();
      }
    } );
  }

  /**
   * only ends with "of Play Area" if qualitative
   */
  getHandPositionDescription( position: number, tickMarkView: TickMarkView ): string {
    return TickMarkView.describeQualitative( tickMarkView ) ? HandPositionsDescriber.getQualitativePosition( position ) :
           this.getQuantitativeHandPosition( position, TickMarkView.describeSemiQualitative( tickMarkView ) );
  }

  private getQuantitativeHandPosition( handPosition: number, semiQuantitative = false ): string {
    const tickMarkData = this.tickMarkDescriber.getRelativePositionAndTickMarkNumberForPosition( handPosition );

    // semi quantitative description uses ordinal numbers instead of full numbers.
    if ( semiQuantitative && typeof tickMarkData.ordinalPosition === 'string' ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.tickMark.semiQuantitativeHandPositionPattern, {
        relativePosition: tickMarkData.relativePosition,
        ordinal: tickMarkData.ordinalPosition
      } );
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.tickMark.quantitativeHandPositionPattern, {
      relativePosition: tickMarkData.relativePosition,
      tickMarkPosition: tickMarkData.tickMarkPosition
    } );
  }

  private static getQualitativePosition( position: number ): string {
    assert && assert( TOTAL_RANGE.contains( position ), 'position expected to be in position range' );

    const normalizedPosition = TOTAL_RANGE.getNormalizedValue( position );

    let region = null;

    for ( let i = 0; i < POSITION_REGIONS_DATA.length; i++ ) {
      const positionRegionDatum = POSITION_REGIONS_DATA[ i ];

      if ( positionRegionDatum.positionInRegion( normalizedPosition ) ) { // eslint-disable-line no-eval
        region = positionRegionDatum.region;
        break;
      }
    }

    assert && assert( region !== null, 'should have been in one of these regions' );

    return region!;
  }

  /**
   * NOTE: These values are copied over in RAPPositionRegionsLayer, consult that Node before changing these values.
   */
  getDistanceRegion( lowercase: boolean, distance: number = this.ratioTupleProperty.value.getDistance() ): string {

    assert && assert( TOTAL_RANGE.getLength() === 1, 'these hard coded values depend on a range of 1' );

    let index = null;
    if ( distance === TOTAL_RANGE.getLength() ) {
      index = 0;
    }
    else if ( distance >= 0.85 ) {
      index = 1;
    }
    else if ( distance >= 0.7 ) {
      index = 2;
    }
    else if ( distance >= 0.55 ) {
      index = 3;
    }
    else if ( distance >= 0.4 ) {
      index = 4;
    }
    else if ( distance >= 0.3 ) {
      index = 5;
    }
    else if ( distance >= 0.2 ) {
      index = 6;
    }
    else if ( distance >= 0.1 ) {
      index = 7;
    }
    else if ( distance > 0 ) {
      index = 8;
    }
    else if ( distance === 0 ) {
      index = 9;
    }
    assert && assert( index !== null, `index is still null, perhaps because distance is ${distance}` );
    index = index as number;
    assert && assert( index < DISTANCE_REGIONS_CAPITALIZED.length, 'out of range' );
    return ( lowercase ? DISTANCE_REGIONS_LOWERCASE : DISTANCE_REGIONS_CAPITALIZED )[ index ];
  }

  getSingleHandContextResponse( ratioTerm: RatioTerm, tickMarkView: TickMarkView, providedOptions?: HandContextResponseOptions ): string {

    const options = optionize<HandContextResponseOptions, HandContextResponseOptions>()( {

      // By default, let the describer decide if we should have distance progress or region
      distanceResponseType: DistanceResponseType.COMBO
    }, providedOptions );

    const ratioLockedEdgeResponse = this.getGoBeyondContextResponse( this.ratioTupleProperty.value, ratioTerm );
    if ( ratioLockedEdgeResponse ) {
      return ratioLockedEdgeResponse;
    }

    let distanceClause = null;
    switch( options.distanceResponseType ) {
      case DistanceResponseType.COMBO:
        distanceClause = this.getSingleHandComboDistance( ratioTerm );
        break;
      case DistanceResponseType.DISTANCE_PROGRESS:
        distanceClause = this.getDistanceProgressClause();
        break;
      case DistanceResponseType.DISTANCE_REGION:
        distanceClause = this.getDistanceRegion( false );
        break;
      default:
        assert && assert( false, 'This is not how enums work' );
    }

    assert && assert( distanceClause, 'Should be filled in by now' );
    const otherHand = ratioTerm === RatioTerm.ANTECEDENT ? rightHandLowerString : leftHandLowerString;

    const distanceResponse = StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
      otherHand: otherHand,
      distanceOrDistanceProgress: distanceClause
    } );

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse, {
      distance: distanceResponse,
      position: this.getHandPositionDescription( this.ratioTupleProperty.value.getForTerm( ratioTerm ),
        tickMarkView )
    } );
  }

  /**
   * NOTE: if in-proportion, this will still return the distance region
   */
  private getDistanceProgressClause(): string {

    // Fall back to distance region if there is no distance progress to deliver
    return this.getDistanceProgressString() || this.getDistanceRegion( false );
  }

  /**
   * This "combo" approach will conditionally provide distance-progress to make sure repetition is not heard within
   * distance regions.
   */
  getSingleHandComboDistance( ratioTerm: RatioTerm ): string {

    const distanceRegion = this.getDistanceRegion( false );

    if ( distanceRegion === this.previousDistanceRegionSingle ) {
      const distanceProgressPhrase = this.getDistanceProgressString();
      const currentValue = this.ratioTupleProperty.value.getForTerm( ratioTerm );
      const handAtMinMax = TOTAL_RANGE.min === currentValue || TOTAL_RANGE.max === currentValue;

      // No distanceProgressPhrase means they are equal, don't give closer/farther at range extremities.
      if ( distanceProgressPhrase && !handAtMinMax ) {

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegionSingle = distanceProgressPhrase;
        return distanceProgressPhrase;
      }
    }

    this.previousDistanceRegionSingle = distanceRegion;

    return distanceRegion;
  }

  // TODO: capitalized is currently always used, but it would be nice to improve the implementation for voicing context responses, https://github.com/phetsims/ratio-and-proportion/issues/461
  getBothHandsDistance( capitalized: boolean, providedOptions?: HandContextResponseOptions ): string {
    const options = optionize<HandContextResponseOptions>()( {

      // By default, let the describer decide if we should have distance progress or region
      distanceResponseType: DistanceResponseType.COMBO
    }, providedOptions );

    switch( options.distanceResponseType ) {
      case DistanceResponseType.COMBO:
        return this.getBothHandsComboDistance( capitalized );
      case DistanceResponseType.DISTANCE_PROGRESS:
        return this.getBothHandsDistanceProgress( capitalized );
      case DistanceResponseType.DISTANCE_REGION:
        return this.getBothHandsDistanceRegion( capitalized );
      default:
        assert && assert( false, 'This is not how enums work' );
    }
    assert && assert( false, 'We should always have a distance case above' );
    return 'A serious logic error occurred';
  }

  getBothHandsDistanceProgress( capitalized: boolean ): string {
    const distanceProgressPhrase = this.getDistanceProgressString( {
      inProportionOverridesDistanceProgress: false,
      closerString: ratioAndProportionStrings.a11y.handPosition.closerTogether,
      fartherString: ratioAndProportionStrings.a11y.handPosition.fartherApart
    } );
    if ( distanceProgressPhrase ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.handsDistanceProgressPattern, {
        distanceProgress: distanceProgressPhrase
      } );
    }
    return this.getBothHandsDistanceRegion( capitalized );
  }

  getBothHandsDistanceRegion( capitalized: boolean ): string {
    const distanceRegion = this.getDistanceRegion( true );

    const pattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalized :
                    ratioAndProportionStrings.a11y.bothHands.handsDistancePattern;

    return StringUtils.fillIn( pattern, { distance: distanceRegion } );
  }

  getBothHandsComboDistance( capitalized = false ): string {
    const distanceRegion = this.getDistanceRegion( true );

    if ( distanceRegion === this.previousDistanceRegionBoth ) {
      assert && assert( capitalized, 'overriding with distance-progress not supported for capitalized strings' );

      const distanceProgressPhrase = this.getDistanceProgressString( {
        inProportionOverridesDistanceProgress: false,
        closerString: ratioAndProportionStrings.a11y.handPosition.closerTogether,
        fartherString: ratioAndProportionStrings.a11y.handPosition.fartherApart
      } );
      if ( distanceProgressPhrase ) {
        const distanceProgressDescription = StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.handsDistanceProgressPattern, {
          distanceProgress: distanceProgressPhrase
        } );

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegionBoth = distanceProgressDescription;
        return distanceProgressDescription;
      }
    }
    this.previousDistanceRegionBoth = distanceRegion;
    return this.getBothHandsDistanceRegion( capitalized );
  }

  private getDistanceProgressString( providedOptions?: GetDistanceProgressStringOptions ): null | string {

    const options = optionize<GetDistanceProgressStringOptions, GetDistanceProgressStringOptions>()( {
      inProportionOverridesDistanceProgress: true,
      closerString: ratioAndProportionStrings.a11y.handPosition.closerTo,
      fartherString: ratioAndProportionStrings.a11y.handPosition.fartherFrom
    }, providedOptions );

    // No distance progress if in proportion TODO: this shouldn't occur for both hands in description, not clear if the same in voicing. https://github.com/phetsims/ratio-and-proportion/issues/459
    if ( options.inProportionOverridesDistanceProgress && this.inProportionProperty.value ) {
      return null;
    }

    const currentDistance = this.ratioTupleProperty.value.getDistance();
    let distanceProgressString = null;
    if ( currentDistance < this.previousDistance ) {
      distanceProgressString = options.closerString;
    }
    else if ( currentDistance > this.previousDistance ) {
      distanceProgressString = options.fartherString;
    }
    else {
      return null; // somehow positions are equal, same case as in proportion
    }

    return distanceProgressString;
  }

  /**
   * Create a response trigger when at an edge, and you try to move beyond it. This takes into consideration, what the
   * previous ratio value was, the current value, and what modality was most recently used. If just moving the antecedent
   * or consequent, then the response is simpler about what hand moved, but we need to hand the "both hands moved at the
   * same time" case as well.
   *
   * @param currentTuple
   * @param mostRecentlyMoved - By specifying the RatioTerm last moved, handle the case where both terms are at the edge
   * but only the changed one should reflect in the response. "Moved" is a misnomer because if at edge and trying to
   * "go beyond", the position won't change value.
   *
   * @returns - null if there is no go-beyond-edge response
   */
  getGoBeyondContextResponse( currentTuple: RAPRatioTuple, mostRecentlyMoved: RatioInputModality ): string | null {

    const enabledRange = this.enabledRatioTermsRangeProperty.value;

    const previousAntecedentAtMin = this.previousEdgeCheckTuple.antecedent === enabledRange.min;
    const previousAntecedentAtMax = this.previousEdgeCheckTuple.antecedent === enabledRange.max;
    const previousConsequentAtMin = this.previousEdgeCheckTuple.consequent === enabledRange.min;
    const previousConsequentAtMax = this.previousEdgeCheckTuple.consequent === enabledRange.max;

    // If moved both terms, and either were previously at an extremity
    const movedEitherFromBothHandsAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.BOTH_HANDS && (
      previousAntecedentAtMin || previousAntecedentAtMax || previousConsequentAtMin || previousConsequentAtMax );

    // If moved the antecedent, and it was previously at an extremity.
    const movedAntecedentAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.ANTECEDENT &&
                                             ( previousAntecedentAtMin || previousAntecedentAtMax );

    // If moved the consequen, and it was previously at an extremity.
    const movedConsequentAndPreviousAtEdge = mostRecentlyMoved === RatioInputModality.CONSEQUENT &&
                                             ( previousConsequentAtMin || previousConsequentAtMax );

    // No previous value was at an extremity when moving that modality.
    if ( !( movedEitherFromBothHandsAndPreviousAtEdge || movedAntecedentAndPreviousAtEdge ||
            movedConsequentAndPreviousAtEdge ) ) {
      this.previousEdgeCheckTuple = currentTuple;
      return null;
    }

    let handAtEdge = null; // what hand?
    let extremityPosition = null; // where are we now?
    let direction = null; // where to go from here?

    // If we should look at the term as a possible "go beyond edge" case.
    const antecedentPossibleBeyond = movedAntecedentAndPreviousAtEdge || movedEitherFromBothHandsAndPreviousAtEdge;
    const consequentPossibleBeyond = movedConsequentAndPreviousAtEdge || movedEitherFromBothHandsAndPreviousAtEdge;

    if ( antecedentPossibleBeyond && previousAntecedentAtMin &&
         this.ratioTupleProperty.value.antecedent === enabledRange.min ) {
      handAtEdge = ratioAndProportionStrings.a11y.leftHand;
      extremityPosition = enabledRange.min === rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min ?
                          ratioAndProportionStrings.a11y.handPosition.atBottom :
                          ratioAndProportionStrings.a11y.handPosition.nearBottom;
      direction = ratioAndProportionStrings.a11y.up;
    }
    else if ( antecedentPossibleBeyond && previousAntecedentAtMax &&
              this.ratioTupleProperty.value.antecedent === enabledRange.max ) {
      handAtEdge = ratioAndProportionStrings.a11y.leftHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
      direction = ratioAndProportionStrings.a11y.down;
    }
    else if ( consequentPossibleBeyond && previousConsequentAtMin
              && this.ratioTupleProperty.value.consequent === enabledRange.min ) {
      handAtEdge = ratioAndProportionStrings.a11y.rightHand;
      extremityPosition = enabledRange.min === rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min ?
                          ratioAndProportionStrings.a11y.handPosition.atBottom :
                          ratioAndProportionStrings.a11y.handPosition.nearBottom;
      direction = ratioAndProportionStrings.a11y.up;
    }
    else if ( consequentPossibleBeyond && previousConsequentAtMax
              && this.ratioTupleProperty.value.consequent === enabledRange.max ) {
      handAtEdge = ratioAndProportionStrings.a11y.rightHand;
      extremityPosition = ratioAndProportionStrings.a11y.handPosition.atTop;
      direction = ratioAndProportionStrings.a11y.down;
    }

    this.previousEdgeCheckTuple = currentTuple;

    // Detect if we are at the edge of the range
    if ( handAtEdge && extremityPosition && direction ) {

      // if hands move together, then the response will reflect both hands in the same direction
      const handsMoveTogether = this.ratioLockedProperty.value;

      // Basically the difference between "Move hands" and "Move hand"
      const pattern = handsMoveTogether ?
                      ratioAndProportionStrings.a11y.ratio.bothHandsGoBeyondEdgeContextResponse :
                      ratioAndProportionStrings.a11y.ratio.singleHandGoBeyondEdgeContextResponse;

      return StringUtils.fillIn( pattern, {
        position: extremityPosition,
        hand: handAtEdge,
        direction: direction
      } );
    }

    return null;
  }

  reset(): void {
    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = this.ratioTupleProperty.value.getDistance();
    this.previousEdgeCheckTuple = this.ratioTupleProperty.value;
  }
}

HandPositionsDescriber.POSITION_REGIONS_DATA = POSITION_REGIONS_DATA;

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;