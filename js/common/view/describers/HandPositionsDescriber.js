// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship like the distance between each
 * hand, and if they have gotten closer to or farther from each other.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import TickMarkView from '../TickMarkView.js';

// constants
const DirectionChanged = Enumeration.byKeys( [ 'CLOSER', 'FARTHER', 'NEITHER' ] );

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

class HandPositionsDescriber {

  /**
   * @param {Property.<number>}antecedentProperty
   * @param {Property.<number>}consequentProperty
   * @param {Range} valueRange
   * @param {TickMarkDescriber} tickMarkDescriber
   */
  constructor( antecedentProperty, consequentProperty, valueRange, tickMarkDescriber ) {

    // @private - from model
    this.antecedentProperty = antecedentProperty;
    this.consequentProperty = consequentProperty;
    this.valueRange = valueRange;
    this.tickMarkDescriber = tickMarkDescriber;

    // @private - keep track of previous distance regions to track repetition, and alter description accordingly
    this.previousBothHandsDistanceRegion = null;
    this.previousSingleHandDistanceRegion = null;

    let lastDistance = null;

    // @private
    this.directionOfLastChangeProperty = new DerivedProperty( [
      this.antecedentProperty,
      this.consequentProperty
    ], ( antecedent, consequent ) => {
      const currentDistance = Math.abs( antecedent - consequent );
      if ( lastDistance ) {
        if ( currentDistance < lastDistance ) {
          lastDistance = currentDistance;
          return DirectionChanged.CLOSER;
        }
        if ( currentDistance > lastDistance ) {
          lastDistance = currentDistance;
          return DirectionChanged.FARTHER;
        }
      }
      lastDistance = currentDistance;
      return DirectionChanged.NEITHER;
    } );
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
      const qualitativeHandPosition = QUALITATIVE_POSITIONS[ this.getQualitativePositionIndex( position ) ];
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
   * @returns {number}
   * @public
   */
  getQualitativePositionIndex( position ) {
    assert && assert( this.valueRange.contains( position ), 'position expected to be in valueRange' );

    const normalizedPosition = this.valueRange.getNormalizedValue( position );

    if ( normalizedPosition === this.valueRange.max ) {
      return 0;
    }
    else if ( normalizedPosition >= .9 ) {
      return 1;
    }
    else if ( normalizedPosition > .65 ) {
      return 2;
    }
    else if ( normalizedPosition > .5 ) {
      return 3;
    }
    else if ( normalizedPosition === .5 ) {
      return 4;
    }
    else if ( normalizedPosition >= .35 ) {
      return 5;
    }
    else if ( normalizedPosition > .1 ) {
      return 6;
    }
    else if ( normalizedPosition > this.valueRange.min ) {
      return 7;
    }
    else if ( normalizedPosition === this.valueRange.min ) {
      return 8;
    }

    assert && assert( false, 'we should not get here' );
  }

  /**
   * @private
   * @returns {string}
   */
  getDistanceRegion( lowercase = false ) {
    const distance = Math.abs( this.antecedentProperty.value - this.consequentProperty.value );

    assert && assert( this.valueRange.getLength() === 1, 'these hard coded values depend on a range of 1' );

    let index = null;
    if ( distance === this.valueRange.getLength() ) {
      index = 0;
    }
    else if ( distance >= .85 ) {
      index = 1;
    }
    else if ( distance >= .7 ) {
      index = 2;
    }
    else if ( distance >= .55 ) {
      index = 3;
    }
    else if ( distance >= .4 ) {
      index = 4;
    }
    else if ( distance >= .3 ) {
      index = 5;
    }
    else if ( distance >= .2 ) {
      index = 6;
    }
    else if ( distance >= .1 ) {
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
   * @param {Property} valueProperty - controlling one of the two hands
   * @returns {string}
   */
  getDistanceClauseForProperty( valueProperty ) {
    assert && assert( valueProperty === this.antecedentProperty || valueProperty === this.consequentProperty, 'Should be one of the two' );
    const otherHand = valueProperty === this.antecedentProperty ? rightHandLowerString : leftHandLowerString;

    const distanceRegion = this.getDistanceRegion();

    if ( distanceRegion === this.previousSingleHandDistanceRegion ) {

      let distanceProgress = null;
      if ( this.directionOfLastChangeProperty.value === DirectionChanged.CLOSER ) {
        distanceProgress = ratioAndProportionStrings.a11y.handPosition.closerTo;
      }
      else if ( this.directionOfLastChangeProperty.value === DirectionChanged.FARTHER ) {
        distanceProgress = ratioAndProportionStrings.a11y.handPosition.fartherFrom;
      }
      if ( distanceProgress ) {
        const distanceProgressDescription = StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDistanceProgressClause, {
          otherHand: otherHand,
          distanceOrDistanceProgress: distanceProgress
        } );

        // Count closer/farther as a previous so that we don't ever get two of them at the same time
        this.previousSingleHandDistanceRegion = distanceProgressDescription;
        return distanceProgressDescription;
      }
    }

    this.previousSingleHandDistanceRegion = distanceRegion;

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
      if ( distanceRegion === this.previousBothHandsDistanceRegion ) {
        assert && assert( capitalized, 'overriding with distance-progress not supported for capitalized strings' );

        let distanceProgress = null;
        if ( this.directionOfLastChangeProperty.value === DirectionChanged.CLOSER ) {
          distanceProgress = ratioAndProportionStrings.a11y.handPosition.closerTogether;
        }
        else if ( this.directionOfLastChangeProperty.value === DirectionChanged.FARTHER ) {
          distanceProgress = ratioAndProportionStrings.a11y.handPosition.fartherApart;
        }
        if ( distanceProgress ) {
          const distanceProgressDescription = StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.handsDistanceProgressPattern, {
            distanceProgress: distanceProgress
          } );

          // Count closer/farther as a previous so that we don't ever get two of them at the same time
          this.previousBothHandsDistanceRegion = distanceProgressDescription;
          return distanceProgressDescription;
        }
      }

      this.previousBothHandsDistanceRegion = distanceRegion;
    }

    const pattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalized :
                    ratioAndProportionStrings.a11y.bothHands.handsDistancePattern;

    return StringUtils.fillIn( pattern, { distance: distanceRegion } );
  }
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;