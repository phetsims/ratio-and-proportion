// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship like the distance between each
 * hand, and if they have gotten closer to or farther from each other ("distance progress").
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import RatioTerm from '../../model/RatioTerm.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';

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

class HandPositionsDescriber {

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {TickMarkDescriber} tickMarkDescriber
   */
  constructor( ratioTupleProperty, tickMarkDescriber ) {

    // @private - from model
    this.ratioTupleProperty = ratioTupleProperty;
    this.tickMarkDescriber = tickMarkDescriber;

    // @private - keep track of previous distance regions to track repetition, and alter description accordingly. This
    // is used for any modality getting a distance region in a context response.
    this.previousDistanceRegion = null;
    this.previousDistance = ratioTupleProperty.value.getDistance();
  }

  /**
   * only ends with "of Play Area" if qualitative
   * @public
   * @param {number} position
   * @param {TickMarkView} tickMarkView
   * @param {boolean} useOfPlayArea - whether the position should end with "of Play Area", like "at bottom of Play Area"
   * @returns {string}
   */
  getHandPositionDescription( position, tickMarkView, useOfPlayArea = true ) {
    if ( TickMarkView.describeQualitative( tickMarkView ) ) {
      const qualitativeHandPosition = this.getQualitativePosition( position );
      return !useOfPlayArea ? qualitativeHandPosition : StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
        position: qualitativeHandPosition
      } );
    }
    else {
      return this.getQuantitativeHandPosition( position, TickMarkView.describeSemiQualitative( tickMarkView ) );
    }
  }

  /**
   * @private
   * @param {number} handPosition
   * @param {boolean} semiQuantitative=false
   * @returns {string}
   */
  getQuantitativeHandPosition( handPosition, semiQuantitative = false ) {
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

  /**
   * @param {number} position - relative to the total possible position
   * @returns {string} - the qualitative position
   * @private
   */
  getQualitativePosition( position ) {
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

    return QUALITATIVE_POSITIONS[ index ];
  }

  /**
   * @private
   * @returns {string}
   */
  getDistanceRegion( lowercase = false ) {
    const distance = this.ratioTupleProperty.value.getDistance();

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
    assert && assert( index < DISTANCE_REGIONS_CAPITALIZED.length, 'out of range' );
    return ( lowercase ? DISTANCE_REGIONS_LOWERCASE : DISTANCE_REGIONS_CAPITALIZED )[ index ];
  }

  /**
   * @public
   * @param {RatioTerm} ratioTerm - which ratio term is this for? Antecedent or consequent
   * @returns {string}
   */
  getSingleHandDistance( ratioTerm ) {
    assert && assert( RatioTerm.includes( ratioTerm ), 'unsupported RatioTerm' );
    const otherHand = ratioTerm === RatioTerm.ANTECEDENT ? rightHandLowerString : leftHandLowerString;

    const distanceRegion = this.getDistanceRegion();

    if ( distanceRegion === this.previousDistanceRegion ) {
      const distanceProgressPhrase = this.getDistanceProgressString();
      if ( distanceProgressPhrase ) {

        const distanceProgressDescription = StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
          otherHand: otherHand,
          distanceOrDistanceProgress: distanceProgressPhrase
        } );

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousDistanceRegion = distanceProgressDescription;
        return distanceProgressDescription;
      }
    }

    this.previousDistanceRegion = distanceRegion;

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
      otherHand: otherHand,
      distanceOrDistanceProgress: distanceRegion
    } );
  }

  /**
   * @public
   * @param {boolean} overrideWithDistanceProgress - if a repeated distance should be overridden with distance-progress (closer/farther)
   * @param {boolean} capitalized
   * @returns {string}
   */
  getBothHandsDistance( overrideWithDistanceProgress = false, capitalized = false ) {
    const distanceRegion = this.getDistanceRegion( true );

    if ( overrideWithDistanceProgress ) {
      if ( distanceRegion === this.previousDistanceRegion ) {
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
          this.previousDistanceRegion = distanceProgressDescription;
          return distanceProgressDescription;
        }
      }
      this.previousDistanceRegion = distanceRegion;
    }

    const pattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalized :
                    ratioAndProportionStrings.a11y.bothHands.handsDistancePattern;

    return StringUtils.fillIn( pattern, { distance: distanceRegion } );
  }

  /**
   * @private
   * @param {Object} [options]
   * @returns {string|null} - null if no change
   */
  getDistanceProgressString( options ) {
    options = merge( {
      closerString: ratioAndProportionStrings.a11y.handPosition.closerTo,
      fartherString: ratioAndProportionStrings.a11y.handPosition.fartherFrom
    }, options );

    const currentDistance = this.ratioTupleProperty.value.getDistance();
    let distanceProgressString = null;
    if ( currentDistance < this.previousDistance ) {
      distanceProgressString = options.closerString;
    }
    else if ( currentDistance > this.previousDistance ) {
      distanceProgressString = options.fartherString;
    }

    this.previousDistance = currentDistance;
    return distanceProgressString;
  }
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;