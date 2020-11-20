// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship (like distance apart).
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Property from '../../../../../axon/js/Property.js';
import validate from '../../../../../axon/js/validate.js';
import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import TickMarkView from '../TickMarkView.js';

// constants
const DirectionChanged = Enumeration.byKeys( [ 'CLOSER', 'FARTHER', 'NEITHER' ] );
const DIRECTION_CHANGED_VALIDATOR = { valueType: DirectionChanged };

const leftHandLowerString = ratioAndProportionStrings.a11y.leftHandLower;
const rightHandLowerString = ratioAndProportionStrings.a11y.rightHandLower;

const QUALITATIVE_POSITIONS = [
  ratioAndProportionStrings.a11y.handPosition.atBottom,
  ratioAndProportionStrings.a11y.handPosition.nearBottom,
  ratioAndProportionStrings.a11y.handPosition.somewhatNearBottom,
  ratioAndProportionStrings.a11y.handPosition.justBelowMiddle,
  ratioAndProportionStrings.a11y.handPosition.atMiddle,
  ratioAndProportionStrings.a11y.handPosition.justAboveMiddle,
  ratioAndProportionStrings.a11y.handPosition.somewhatNearTop,
  ratioAndProportionStrings.a11y.handPosition.nearTop,
  ratioAndProportionStrings.a11y.handPosition.atTop
];
const QUALITATIVE_BOTH_HANDS_POSITIONS = [
  ratioAndProportionStrings.a11y.handPosition.bothHands.atBottom,
  ratioAndProportionStrings.a11y.handPosition.bothHands.inLowerRegion,
  ratioAndProportionStrings.a11y.handPosition.bothHands.inMiddleRegion,
  ratioAndProportionStrings.a11y.handPosition.bothHands.atMiddle,
  ratioAndProportionStrings.a11y.handPosition.bothHands.inMiddleRegion,
  ratioAndProportionStrings.a11y.handPosition.bothHands.inUpperRegion,
  ratioAndProportionStrings.a11y.handPosition.bothHands.atTop
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
   * @param {Property.<number>}numeratorProperty
   * @param {Property.<number>}denominatorProperty
   * @param {Range} valueRange
   * @param {TickMarkDescriber} tickMarkDescriber
   */
  constructor( numeratorProperty, denominatorProperty, valueRange, tickMarkDescriber ) {

    // @private - from model
    this.numeratorProperty = numeratorProperty;
    this.denominatorProperty = denominatorProperty;
    this.valueRange = valueRange;
    this.tickMarkDescriber = tickMarkDescriber;

    // @private
    this.lastNumeratorValueProperty = new NumberProperty( numeratorProperty.value );
    this.lastDenominatorValueProperty = new NumberProperty( denominatorProperty.value );

    // @private - initialized to null, but only set to boolean
    this.previousNumeratorChangeProperty = new Property( null );
    this.previousDenominatorChangeProperty = new Property( null );
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
      const qualitativeHandPosition = this.getQualitativeHandPosition( position );
      return !useOfPlayArea ? qualitativeHandPosition : StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
        position: qualitativeHandPosition
      } );
    }
    else {
      return this.getQuantitativeHandPosition( position, TickMarkView.describeSemiQualitative( tickMarkView ) );
    }
  }

  /**
   * Description of a single hand in the context of both hands.
   * @public
   * @param {position} position
   * @param {TickMarkView} tickMarkView
   * @returns {string}
   */
  getBothHandsHandDescription( position, tickMarkView ) {
    if ( TickMarkView.describeQualitative( tickMarkView ) ) {
      return this.getQualitativeBothHandsHandPosition( position );
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
   * @private
   * @param {number} handPosition
   * @returns {string}
   */
  getQualitativeHandPosition( handPosition ) {
    return QUALITATIVE_POSITIONS[ this.getQualitativePositionIndex( handPosition ) ];
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
   * @private
   * @param {number} handPosition
   * @returns {string}
   */
  getQualitativeBothHandsHandPosition( handPosition ) {
    return QUALITATIVE_BOTH_HANDS_POSITIONS[ this.getQualitativeBothHandsHandPositionIndex( handPosition ) ];
  }

  /**
   * @param {number} position - relative to the total possible position
   * @returns {number}
   * @public
   */
  getQualitativeBothHandsHandPositionIndex( position ) {
    assert && assert( this.valueRange.contains( position ), 'position expected to be in valueRange' );

    const normalizedPosition = this.valueRange.getNormalizedValue( position );

    if ( normalizedPosition === this.valueRange.max ) {
      return 6;
    }
    else if ( normalizedPosition > .7 ) {
      return 5;
    }
    else if ( normalizedPosition > .5 ) {
      return 4;
    }
    else if ( normalizedPosition === .5 ) {
      return 3;
    }
    else if ( normalizedPosition > .3 ) {
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
   * @private
   * @returns {number}
   */
  getDistanceBetweenHands() {
    return Math.abs( this.numeratorProperty.value - this.denominatorProperty.value );
  }

  /**
   * @private
   * @returns {string}
   */
  getDistanceRegion( lowercase = false ) {
    const distance = this.getDistanceBetweenHands();

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
   * @param {NumberProperty} valueProperty
   * @param {boolean} capitalized
   * @returns {string}
   */
  getDistanceClauseForProperty( valueProperty, capitalized = true ) {

    let prefix = null;
    const directionChange = this.getDirectionChangedState( valueProperty );
    switch( directionChange ) {
      case DirectionChanged.CLOSER:
        prefix = capitalized ? ratioAndProportionStrings.a11y.handPosition.closerTo :
                 ratioAndProportionStrings.a11y.handPosition.closerToLowercase;
        break;
      case DirectionChanged.FARTHER:
        prefix = capitalized ? ratioAndProportionStrings.a11y.handPosition.fartherFrom :
                 ratioAndProportionStrings.a11y.handPosition.fartherFromLowercase;
        break;
      case DirectionChanged.NEITHER:
        prefix = this.getDistanceRegion();
        break;
      default:
        assert && assert( false, 'all cases above' );
    }

    const otherHand = valueProperty === this.numeratorProperty ? rightHandLowerString : leftHandLowerString;

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDirectionClause, {
      otherHand: otherHand,
      distanceOrDirection: prefix
    } );
  }

  /**
   * This is complicated because you need relative distance between the two values and if they get closer or farther
   * last time. As  well as the need to call this for individual and both-hands interactions.
   * TODO: this could be written much simpler using ratioTupleProperty, maybe?
   * @private
   * @param {NumberProperty} valueProperty
   * @returns {DirectionChanged}
   */
  getDirectionChangedState( valueProperty ) {
    const previousValueProperty = valueProperty === this.numeratorProperty ? this.lastNumeratorValueProperty : this.lastDenominatorValueProperty;
    const otherPreviousValueProperty = valueProperty === this.numeratorProperty ? this.lastDenominatorValueProperty : this.lastNumeratorValueProperty;
    const previousChangeProperty = valueProperty === this.numeratorProperty ? this.previousNumeratorChangeProperty : this.previousDenominatorChangeProperty;
    const otherValueProperty = valueProperty === this.numeratorProperty ? this.denominatorProperty : this.numeratorProperty;

    const increasing = valueProperty.value > previousValueProperty.value;

    let returnValue = null;

    if ( increasing !== previousChangeProperty.value && // if the direction changed
         valueProperty.value !== otherValueProperty.value && // if the two value positions are the same
         valueProperty.value !== previousValueProperty.value ) { // if the value position didn't change

      // if the new distance is larger than the previous.
      const distanceGrew = Math.abs( otherValueProperty.value - valueProperty.value ) >
                           Math.abs( otherPreviousValueProperty.value - previousValueProperty.value );
      returnValue = distanceGrew ? DirectionChanged.FARTHER :
                    DirectionChanged.CLOSER;
    }
    else {
      returnValue = DirectionChanged.NEITHER;
    }

    // For next time
    previousValueProperty.value = valueProperty.value;
    otherPreviousValueProperty.value = otherValueProperty.value;
    previousChangeProperty.value = increasing;

    validate( returnValue, DIRECTION_CHANGED_VALIDATOR );
    return returnValue;
  }

  /**
   * @public
   * @param {TickMarkView} tickMarkView
   * @param {boolean} capitalized
   * @returns {string}
   */
  getBothHandsDistance( tickMarkView, capitalized = false ) {
    const pattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDistancePatternCapitalized :
                    ratioAndProportionStrings.a11y.bothHands.handsDistancePattern;
    return StringUtils.fillIn( pattern, {
      distance: this.getDistanceRegion( true )
    } );
  }

  /**
   * If the hands changed directions (closer/farther) from each other, then prioritize describing
   * that over the standard distance text. This supports this behavior on both ratio value Properties.
   * @public
   * @param {Property.<Number>} valueProperty
   * @param {TickMarkView} tickMarkView
   * @param {boolean} capitalized
   * @returns {string}
   */
  getBothHandsDistanceOrDirection( valueProperty, tickMarkView, capitalized = false ) {
    const directionChange = this.getDirectionChangedState( valueProperty );

    const directionPattern = capitalized ? ratioAndProportionStrings.a11y.bothHands.handsDirectionPatternCapitalized :
                             ratioAndProportionStrings.a11y.bothHands.handsDirectionPattern;

    let distance = null;
    switch( directionChange ) {
      case DirectionChanged.CLOSER:
        distance = StringUtils.fillIn( directionPattern, {
          distance: ratioAndProportionStrings.a11y.bothHands.closerTogether
        } );
        break;
      case DirectionChanged.FARTHER:
        distance = StringUtils.fillIn( directionPattern, {
          distance: ratioAndProportionStrings.a11y.bothHands.fartherApart
        } );
        break;
      case DirectionChanged.NEITHER:
        distance = this.getBothHandsDistance( tickMarkView, capitalized );
        break;
      default:
        assert && assert( false, 'all cases above' );
    }
    return distance;
  }
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;