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
  ratioAndProportionStrings.a11y.tickMark.relative.almostHalfWayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.halfwayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.justOverHalfWayPast,
  ratioAndProportionStrings.a11y.tickMark.relative.almostOn
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

const BIGGER_THAN_MIDDLE_THRESHOLD = .6;

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
   * @returns {{tickMarkPosition: number, relativePosition: string}}
   */
  getRelativePositionAndTickMarkNumberForProperty( property ) {
    assert && assert( this.valueRange.contains( property.value ) );

    const normalized = this.valueRange.getNormalizedValue( property.value );
    const numberOfTickMarks = this.tickMarkRangeProperty.value;

    // account for javascript rounding error
    const expandedValue = Utils.toFixedNumber( normalized * numberOfTickMarks, 6 );

    // account for javascript rounding error
    const remainder = Utils.toFixedNumber( expandedValue % 1, 6 );
    assert && assert( remainder < 1 && remainder >= 0 );

    const relativePosition = this.getRelativePosition( remainder );

    const tickMarkNumber = remainder >= BIGGER_THAN_MIDDLE_THRESHOLD ? Math.ceil( expandedValue ) : Math.floor( expandedValue );

    const ordinalPosition = tickMarkNumber === numberOfTickMarks ? null : ORDINAL_TICK_MARKS[ tickMarkNumber ];
    assert && assert( ordinalPosition !== undefined );

    assert && assert( relativePosition );
    return {
      tickMarkPosition: tickMarkNumber,
      relativePosition: relativePosition,
      ordinalPosition: ordinalPosition
    };
  }

  /**
   * @private
   * @param {number} value - must be in range [0,1) (not including 1). Basically this is the "remainder" position in
   * between two tick marks
   * @returns {string} the relative position given the position from a tick mark.
   */
  getRelativePosition( value ) {
    assert && assert( RELATIVE_POSITION_STRINGS.length === 6, '6 regions expected' );
    assert && assert( value < 1 && value >= 0, 'value not in range' );

    let index = null;
    if ( value === this.valueRange.min ) {
      index = 0;
    }
    else if ( value <= .2 ) {
      index = 1;
    }
    else if ( value <= .4 ) {
      index = 2;
    }
    else if ( value < BIGGER_THAN_MIDDLE_THRESHOLD ) {
      index = 3;
    }
    else if ( value < .8 ) {

      // Use the constant "BIGGER_THAN_MIDDLE_THRESHOLD" to make sure that "in the middle of" refers to the tick mark
      // below, and everything higher refers to the next tick mark up.
      assert && assert( RELATIVE_POSITION_STRINGS[ 3 ].toLowerCase().includes( 'halfway' ), 'this middle position should be the previous' );
      index = 4;
    }
    else if ( value < 1 ) {
      index = 5;
    }
    assert && assert( typeof index === 'number' );
    return RELATIVE_POSITION_STRINGS[ index ];
  }
}

ratioAndProportion.register( 'TickMarkDescriber', TickMarkDescriber );
export default TickMarkDescriber;