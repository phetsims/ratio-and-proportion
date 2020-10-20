// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import TickMarkView from '../TickMarkView.js';

// constants
const RELATIVE_POSITION_STRINGS = [
  ratioAndProportionStrings.a11y.tickMark.relative.on,
  ratioAndProportionStrings.a11y.tickMark.relative.around,
  ratioAndProportionStrings.a11y.tickMark.relative.aroundHalfWayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.halfwayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.aroundHalfWayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.around
];

const ORDINAL_TICK_MARKS = [
  null,
  ratioAndProportionStrings.a11y.tickMark.ordinal.first,
  ratioAndProportionStrings.a11y.tickMark.ordinal.second,
  ratioAndProportionStrings.a11y.tickMark.ordinal.third,
  ratioAndProportionStrings.a11y.tickMark.ordinal.fourth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.fifth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.sixth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.seventh,
  ratioAndProportionStrings.a11y.tickMark.ordinal.eighth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.ninth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.tenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.eleventh,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twelfth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.thirteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.fourteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.fifteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.sixteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.seventeenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.eighteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.nineteenth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentieth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyFirst,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentySecond,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyThird,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyFourth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyFifth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentySixth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentySeventh,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyEighth,
  ratioAndProportionStrings.a11y.tickMark.ordinal.twentyNinth
];

// The value in which up to and including this value, the relative description will apply to the value of the tick mark
// rounded down, instead of up, from this remainder.
const ROUND_DOWN_THRESHOLD = .7;

class TickMarkDescriber {

  /**
   * @param {Range} valueRange
   * @param {Property.<number>} tickMarkRangeProperty
   */
  constructor( valueRange, tickMarkRangeProperty ) {

    // @private
    this.valueRange = valueRange;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
  }

  /**
   * Get the distance between the two hands in tick marks. Changes based on quantitative vs semi-quantitative
   * @public
   * @param tickMarkView
   * @param distanceBetweenHands
   */
  getDistanceInTickMarks( tickMarkView, distanceBetweenHands ) {
    assert && assert( !TickMarkView.describeQualitative( tickMarkView ), 'no qualitative description here' );

    const numberOfTickMarks = this.tickMarkRangeProperty.value;

    // account for javascript rounding error
    const expandedValue = Utils.toFixedNumber( distanceBetweenHands * numberOfTickMarks, 6 );

    // account for javascript rounding error
    const remainder = Utils.toFixedNumber( expandedValue % 1, 6 );
    assert && assert( remainder < 1 && remainder >= 0 );

    const flooredTickMark = Math.floor( expandedValue );

    const REMAINDER_THRESHOLD = .5;

    let distance = null;
    let justAround = '';

    if ( remainder === 0 ) {
      distance = expandedValue;
    }
    else if ( remainder === REMAINDER_THRESHOLD ) { // TODO: .5 exact too strict?

      if ( TickMarkView.describeSemiQualitative( tickMarkView ) ) {
        distance = StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.andAndAHalf, {
          number: flooredTickMark
        } );
      }
      else {
        distance = Utils.toFixedNumber( expandedValue, 1 );
      }
    }
    else if ( remainder > REMAINDER_THRESHOLD ) {

      distance = Math.ceil( expandedValue );
      justAround = ratioAndProportionStrings.a11y.bothHands.justUnder;

    }
    else if ( remainder < REMAINDER_THRESHOLD ) {
      distance = flooredTickMark;
      justAround = ratioAndProportionStrings.a11y.bothHands.justOver;
    }
    assert && assert( distance !== null );

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.tickMarksApart, {
      number: distance,
      justAround: justAround
    } );
  }

  /**
   * @public
   * @param {Property.<number>} property
   * @returns {{tickMarkPosition: number, relativePosition: string , ordinalPosition: string|null }}
   */
  getRelativePositionAndTickMarkNumberForProperty( property ) {
    assert && assert( this.valueRange.contains( property.value ) );

    const normalized = this.valueRange.getNormalizedValue( property.value );
    const numberOfTickMarks = this.tickMarkRangeProperty.value;

    // account for javascript rounding error
    const expandedValue = Utils.toFixedNumber( normalized * numberOfTickMarks, 6 );

    // account for javascript rounding error
    const remainder = Utils.toFixedNumber( expandedValue % 1, 6 );

    assert && assert( RELATIVE_POSITION_STRINGS.length === 6, '6 regions expected' );
    assert && assert( remainder < 1 && remainder >= 0, 'remainder not in range' );

    // special treatment from values that are around "half-way"
    let isHalfWayValue = false;

    let relativePositionIndex = null;

    if ( remainder === this.valueRange.min ) {
      relativePositionIndex = 0;
    }
    else if ( remainder <= .2 ) {
      relativePositionIndex = 1;
    }
    else if ( remainder < .5 ) {
      relativePositionIndex = 2;
      isHalfWayValue = true;
    }
    else if ( remainder === .5 ) {
      relativePositionIndex = 3;
      isHalfWayValue = true;
    }
    else if ( remainder <= ROUND_DOWN_THRESHOLD ) {
      relativePositionIndex = 4;
      isHalfWayValue = true;
    }
    else if ( remainder < 1 ) {
      relativePositionIndex = 5;
    }

    const relativePosition = RELATIVE_POSITION_STRINGS[ relativePositionIndex ];

    const tickMarkNumber = remainder > ROUND_DOWN_THRESHOLD ? Math.ceil( expandedValue ) : Math.floor( expandedValue );

    // No ordinal on the max tick mark number
    const ordinalPosition = tickMarkNumber === numberOfTickMarks ? null : ORDINAL_TICK_MARKS[ tickMarkNumber ];
    assert && assert( ordinalPosition !== undefined, 'ordinal number not found' );

    assert && assert( relativePosition );
    return {

      // add a .5 if the tickMark is positioned in the middle
      tickMarkPosition: isHalfWayValue ? tickMarkNumber + .5 : tickMarkNumber,
      relativePosition: relativePosition,
      ordinalPosition: ordinalPosition
    };
  }
}

ratioAndProportion.register( 'TickMarkDescriber', TickMarkDescriber );
export default TickMarkDescriber;