// Copyright 2020, University of Colorado Boulder

/**
 * Class responsible for formulating quantitative description strings about position, based on the value of the ratio
 * relative to the tick marks in the screen.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';

// constants
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
const ROUND_DOWN_THRESHOLD = 0.7;
const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class TickMarkDescriber {

  /**
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   */
  constructor( tickMarkRangeProperty, tickMarkViewProperty ) {

    // @private
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
  }

  /**
   * Implemented like https://github.com/phetsims/ratio-and-proportion/issues/198#issuecomment-710029471 and https://github.com/phetsims/ratio-and-proportion/issues/198#issuecomment-728344102
   * This is a complicated function for a complicated design specification. Logic can split depending on tick mark view
   * with certain edge cases (like for "zero" case).
   * @public
   * @param {number} handPosition
   * @returns {{tickMarkPosition: number|"zero", relativePosition: string , ordinalPosition: string|null }}
   */
  getRelativePositionAndTickMarkNumberForPosition( handPosition ) {
    assert && assert( TOTAL_RANGE.contains( handPosition ) );

    // account for javascript rounding error, don't use rapConstants because we only want to handle rounding trouble.
    const normalized = Utils.toFixedNumber( TOTAL_RANGE.getNormalizedValue( handPosition ), 9 );
    const numberOfTickMarks = this.tickMarkRangeProperty.value;

    // account for javascript rounding error
    const expandedValue = normalized * numberOfTickMarks;

    let remainder = expandedValue % 1;

    if ( Utils.toFixedNumber( remainder, 2 ) === rapConstants.toFixed( remainder ) ) { // eslint-disable-line bad-sim-text
      remainder = rapConstants.toFixed( remainder ); // eslint-disable-line bad-sim-text
    }


    assert && assert( remainder < 1 && remainder >= 0, 'remainder not in range' );

    const roundedUp = Math.ceil( expandedValue );
    const roundedDown = Math.floor( expandedValue );
    const tickMarkNumber = remainder > ROUND_DOWN_THRESHOLD ? roundedUp : roundedDown;
    let tickMarkDisplayedNumber = tickMarkNumber; // could be `tickMarkNumber + .5` depending on the tick mark view
    let relativePosition = null;

    const inZeroCase = tickMarkNumber === 0;
    let ordinalPosition = tickMarkNumber === numberOfTickMarks ? null :
                          inZeroCase ? ORDINAL_TICK_MARKS[ 1 ] :
                          ORDINAL_TICK_MARKS[ tickMarkNumber ];

    const useExactTickMarkValues = this.tickMarkViewProperty.value === TickMarkView.VISIBLE_WITH_UNITS;

    if ( remainder === TOTAL_RANGE.min ) {
      if ( inZeroCase ) {
        relativePosition = ratioAndProportionStrings.a11y.tickMark.relative.at;
        tickMarkDisplayedNumber = ratioAndProportionStrings.a11y.tickMark.relative.zero;
        ordinalPosition = null;
      }
      else {
        relativePosition = ratioAndProportionStrings.a11y.tickMark.relative.on;
      }
    }
    else if ( remainder <= 0.2 ) {
      if ( inZeroCase ) {
        relativePosition = ratioAndProportionStrings.a11y.tickMark.relative.near;
        tickMarkDisplayedNumber = ratioAndProportionStrings.a11y.tickMark.relative.zero;
        ordinalPosition = null;
      }
      else {
        relativePosition = ratioAndProportionStrings.a11y.tickMark.relative.around;
      }
    }
    else if ( remainder <= ROUND_DOWN_THRESHOLD ) {
      // handle these middle cases differently depending on current tickMarkView

      tickMarkDisplayedNumber += 0.5; // For these middle values, add .5

      if ( remainder < 0.5 ) {
        relativePosition = useExactTickMarkValues ? ratioAndProportionStrings.a11y.tickMark.relative.almostOn :
                           inZeroCase ? ratioAndProportionStrings.a11y.tickMark.relative.almostHalfwayTo :
                           ratioAndProportionStrings.a11y.tickMark.relative.almostHalfwayPast;
      }
      else if ( remainder === 0.5 ) {

        // If showing numbers, then the description looks like "on 2.5" instead of "half-way past second"
        relativePosition = useExactTickMarkValues ? ratioAndProportionStrings.a11y.tickMark.relative.on :
                           inZeroCase ? ratioAndProportionStrings.a11y.tickMark.relative.halfwayTo :
                           ratioAndProportionStrings.a11y.tickMark.relative.halfwayPast;
      }
      else if ( remainder <= ROUND_DOWN_THRESHOLD ) {
        relativePosition = useExactTickMarkValues ? ratioAndProportionStrings.a11y.tickMark.relative.around :
                           inZeroCase ? ratioAndProportionStrings.a11y.tickMark.relative.aroundHalfwayTo :
                           ratioAndProportionStrings.a11y.tickMark.relative.aroundHalfwayPast;
      }
      else {
        assert && assert( false, 'all cases should be covered' );
      }
    }
    else if ( remainder < 1 ) {
      relativePosition = ratioAndProportionStrings.a11y.tickMark.relative.almostOn;
    }
    else {
      assert && assert( false, `unexpected remainder value: ${remainder}` );
    }

    assert && assert( ordinalPosition !== undefined, 'ordinal number not found' );

    assert && assert( relativePosition );
    return {
      tickMarkPosition: tickMarkDisplayedNumber,
      relativePosition: relativePosition,
      ordinalPosition: ordinalPosition
    };
  }
}

ratioAndProportion.register( 'TickMarkDescriber', TickMarkDescriber );
export default TickMarkDescriber;