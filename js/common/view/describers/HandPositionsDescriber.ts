// Copyright 2020-2022, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship like the distance between each
 * hand, and if they have gotten closer to or farther from each other ("distance progress").
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

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

// constants
const leftHandLowerString = ratioAndProportionStrings.a11y.leftHandLower;
const rightHandLowerString = ratioAndProportionStrings.a11y.rightHandLower;

const QUALITATIVE_POSITIONS = [
  ratioAndProportionStrings.a11y.handPosition.atTop,
  ratioAndProportionStrings.a11y.handPosition.nearTop,
  ratioAndProportionStrings.a11y.handPosition.inUpperRegion,
  ratioAndProportionStrings.a11y.handPosition.inUpperMiddleRegion,
  ratioAndProportionStrings.a11y.handPosition.atMiddle,
  ratioAndProportionStrings.a11y.handPosition.inLowerMiddleRegion,
  ratioAndProportionStrings.a11y.handPosition.inLowerRegion,
  ratioAndProportionStrings.a11y.handPosition.nearBottom,
  ratioAndProportionStrings.a11y.handPosition.atBottom
];

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

type GetDistanceProgressStringOptions = {
  closerString?: string;
  fartherString?: string;
};

type SingleHandContextResponseOptions = {
  distanceResponseType?: DistanceResponseType
};

class HandPositionsDescriber {

  private ratioTupleProperty: Property<RAPRatioTuple>;
  private tickMarkDescriber: TickMarkDescriber;
  private inProportionProperty: IReadOnlyProperty<boolean>;
  private previousDistanceRegionSingle: null | string;
  private previousDistanceRegionBoth: null | string;
  private previousDistance: number;
  public static QUALITATIVE_POSITIONS: string[];

  constructor( ratioTupleProperty: Property<RAPRatioTuple>, tickMarkDescriber: TickMarkDescriber, inProportionProperty: IReadOnlyProperty<boolean> ) {

    // @private - from model
    this.ratioTupleProperty = ratioTupleProperty;
    this.tickMarkDescriber = tickMarkDescriber;
    this.inProportionProperty = inProportionProperty;

    // @private - keep track of previous distance regions to track repetition, and alter description accordingly. This
    // is used for any modality getting a distance region in a context response.
    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = ratioTupleProperty.value.getDistance();

    ratioTupleProperty.lazyLink( ( newValue, oldValue ) => {
      if ( oldValue ) {
        this.previousDistance = oldValue.getDistance();
      }
    } );
  }

  /**
   * only ends with "of Play Area" if qualitative
   * @param position
   * @param tickMarkView
   */
  public getHandPositionDescription( position: number, tickMarkView: TickMarkView ): string {
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

    let index = null;
    if ( normalizedPosition === TOTAL_RANGE.max ) {
      index = 0;
    }
    else if ( normalizedPosition >= 0.9 ) {
      index = 1;
    }
    else if ( normalizedPosition > 0.65 ) {
      index = 2;
    }
    else if ( normalizedPosition > 0.5 ) {
      index = 3;
    }
    else if ( normalizedPosition === 0.5 ) {
      index = 4;
    }
    else if ( normalizedPosition >= 0.35 ) {
      index = 5;
    }
    else if ( normalizedPosition > 0.1 ) {
      index = 6;
    }
    else if ( normalizedPosition > TOTAL_RANGE.min ) {
      index = 7;
    }
    else if ( normalizedPosition === TOTAL_RANGE.min ) {
      index = 8;
    }

    assert && assert( index !== null, 'should have been in one of these regions' );

    return QUALITATIVE_POSITIONS[ index as number ];
  }

  /**
   * NOTE: These values are copied over in RAPPositionRegionsLayer, consult that Node before changing these values.
   */
  public getDistanceRegion( lowercase: boolean, distance: number = this.ratioTupleProperty.value.getDistance() ): string {

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
    assert && assert( index !== null );
    index = index as number;
    assert && assert( index < DISTANCE_REGIONS_CAPITALIZED.length, 'out of range' );
    return ( lowercase ? DISTANCE_REGIONS_LOWERCASE : DISTANCE_REGIONS_CAPITALIZED )[ index ];
  }

  public getSingleHandContextResponse( ratioTerm: RatioTerm, tickMarkView: TickMarkView, providedOptions?: SingleHandContextResponseOptions ): string {

    const options = optionize<SingleHandContextResponseOptions, SingleHandContextResponseOptions>( {

      // By default, let the describer decide if we should have distance progress or region
      distanceResponseType: DistanceResponseType.COMBO
    }, providedOptions );

    let distanceResponse = null;
    switch( options.distanceResponseType ) {
      case DistanceResponseType.COMBO:
        distanceResponse = this.getSingleHandComboDistance( ratioTerm );
        break;
      case DistanceResponseType.DISTANCE_PROGRESS:
        distanceResponse = this.getSingleHandDistanceProgressSentence( ratioTerm );
        break;
      case DistanceResponseType.DISTANCE_REGION:
        distanceResponse = this.getSingleHandDistanceRegionSentence( ratioTerm );
        break;
      default:
        assert && assert( false, 'This is not how enums work' );
    }

    assert && assert( distanceResponse, 'Should be filled in by now' );

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse, {
      distance: distanceResponse,
      position: this.getHandPositionDescription( this.ratioTupleProperty.value.getForTerm( ratioTerm ),
        tickMarkView )
    } );
  }

  public getSingleHandDistanceRegionSentence( ratioTerm: RatioTerm ): string {
    const otherHand = ratioTerm === RatioTerm.ANTECEDENT ? rightHandLowerString : leftHandLowerString;

    const distanceRegion = this.getDistanceRegion( false );

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
      otherHand: otherHand,
      distanceOrDistanceProgress: distanceRegion
    } );
  }

  // NOTE: if in-proportion, this will still return the distance region
  public getSingleHandDistanceProgressSentence( ratioTerm: RatioTerm ): string {
    const otherHand = ratioTerm === RatioTerm.ANTECEDENT ? rightHandLowerString : leftHandLowerString;
    let distanceProgress = this.getDistanceProgressString();

    if ( distanceProgress === null ) {
      distanceProgress = this.getDistanceRegion( false );
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
      otherHand: otherHand,
      distanceOrDistanceProgress: distanceProgress
    } );
  }

  // This "combo" approach will conditionally provide distance-progress to make sure repetition is not heard within
  // distance regions.
  public getSingleHandComboDistance( ratioTerm: RatioTerm ): string {
    const otherHand = ratioTerm === RatioTerm.ANTECEDENT ? rightHandLowerString : leftHandLowerString;

    const distanceRegion = this.getDistanceRegion( false );

    if ( distanceRegion === this.previousDistanceRegionSingle ) {
      const distanceProgressPhrase = this.getDistanceProgressString();
      if ( distanceProgressPhrase ) {

        const distanceProgressDescription = StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
          otherHand: otherHand,
          distanceOrDistanceProgress: distanceProgressPhrase
        } );

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegionSingle = distanceProgressPhrase;
        return distanceProgressDescription;
      }
    }

    this.previousDistanceRegionSingle = distanceRegion;

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
      otherHand: otherHand,
      distanceOrDistanceProgress: distanceRegion
    } );
  }

  public getBothHandsDistance( overrideWithDistanceProgress = false, capitalized = false ): string {
    const distanceRegion = this.getDistanceRegion( true );

    if ( overrideWithDistanceProgress ) {
      if ( distanceRegion === this.previousDistanceRegionBoth ) {
        assert && assert( capitalized, 'overriding with distance-progress not supported for capitalized strings' );

        const distanceProgressPhrase = this.getDistanceProgressString( {
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
    }

    const pattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalized :
                    ratioAndProportionStrings.a11y.bothHands.handsDistancePattern;

    return StringUtils.fillIn( pattern, { distance: distanceRegion } );
  }

  private getDistanceProgressString( providedOptions?: GetDistanceProgressStringOptions ): null | string {


    const options = optionize<GetDistanceProgressStringOptions, GetDistanceProgressStringOptions>( {
      closerString: ratioAndProportionStrings.a11y.handPosition.closerTo,
      fartherString: ratioAndProportionStrings.a11y.handPosition.fartherFrom
    }, providedOptions );


    // No distance progress if in proportion
    if ( this.inProportionProperty.value ) {
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

    return distanceProgressString;
  }

  reset(): void {
    this.previousDistanceRegionSingle = null;
    this.previousDistanceRegionBoth = null;

    this.previousDistance = this.ratioTupleProperty.value.getDistance();
  }
}

HandPositionsDescriber.QUALITATIVE_POSITIONS = QUALITATIVE_POSITIONS;

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;
export type { SingleHandContextResponseOptions };