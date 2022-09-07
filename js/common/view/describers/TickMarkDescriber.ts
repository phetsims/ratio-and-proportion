// Copyright 2020-2022, University of Colorado Boulder

/**
 * Class responsible for formulating quantitative description strings about position, based on the value of the ratio
 * relative to the tick marks in the screen.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../../RatioAndProportionStrings.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';
import Property from '../../../../../axon/js/Property.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';

const ORDINAL_TICK_MARKS = [
  null,
  RatioAndProportionStrings.a11y.tickMark.ordinal.first,
  RatioAndProportionStrings.a11y.tickMark.ordinal.second,
  RatioAndProportionStrings.a11y.tickMark.ordinal.third,
  RatioAndProportionStrings.a11y.tickMark.ordinal.fourth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.fifth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.sixth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.seventh,
  RatioAndProportionStrings.a11y.tickMark.ordinal.eighth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.ninth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.tenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.eleventh,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twelfth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.thirteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.fourteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.fifteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.sixteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.seventeenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.eighteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.nineteenth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentieth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyFirst,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentySecond,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyThird,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyFourth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyFifth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentySixth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentySeventh,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyEighth,
  RatioAndProportionStrings.a11y.tickMark.ordinal.twentyNinth
];

const zeroString: 'zero' = RatioAndProportionStrings.a11y.tickMark.relative.zero as 'zero';

type TickMarkDescriptionData = {
  tickMarkPosition: number | 'zero';
  relativePosition: string;
  ordinalPosition: string | null;
};


// The value in which up to and including this value, the relative description will apply to the value of the tick mark
// rounded down, instead of up, from this remainder.
const ROUND_DOWN_THRESHOLD = 0.7;
const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class TickMarkDescriber {

  private tickMarkRangeProperty: Property<number>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;

  public constructor( tickMarkRangeProperty: Property<number>, tickMarkViewProperty: EnumerationProperty<TickMarkView> ) {
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
  }

  /**
   * Implemented like https://github.com/phetsims/ratio-and-proportion/issues/198#issuecomment-710029471 and https://github.com/phetsims/ratio-and-proportion/issues/198#issuecomment-728344102
   * This is a complicated function for a complicated design specification. Logic can split depending on tick mark view
   * with certain edge cases (like for "zero" case).
   */
  public getRelativePositionAndTickMarkNumberForPosition( handPosition: number ): TickMarkDescriptionData {
    assert && assert( TOTAL_RANGE.contains( handPosition ) );

    // account for javascript rounding error, don't use rapConstants because we only want to handle rounding trouble.
    const normalized = Utils.toFixedNumber( TOTAL_RANGE.getNormalizedValue( handPosition ), 9 );
    const numberOfTickMarks = this.tickMarkRangeProperty.value;

    // account for javascript rounding error, less decimal places that above so that remander can be created correctly.
    const expandedValue = Utils.toFixedNumber( normalized * numberOfTickMarks, 7 );

    let remainder = expandedValue % 1;

    if ( Utils.toFixedNumber( remainder, 2 ) === rapConstants.toFixed( remainder ) ) { // eslint-disable-line bad-sim-text
      remainder = rapConstants.toFixed( remainder ); // eslint-disable-line bad-sim-text
    }

    assert && assert( remainder < 1 && remainder >= 0, 'remainder not in range' );

    const roundedUp = Math.ceil( expandedValue );
    const roundedDown = Math.floor( expandedValue );
    const tickMarkNumber = remainder > ROUND_DOWN_THRESHOLD ? roundedUp : roundedDown;
    let tickMarkDisplayedNumber: number | 'zero' = tickMarkNumber; // could be `tickMarkNumber + .5` depending on the tick mark view
    let relativePosition = null;

    const inZeroCase = tickMarkNumber === 0;
    let ordinalPosition = tickMarkNumber === numberOfTickMarks ? null :
                          inZeroCase ? ORDINAL_TICK_MARKS[ 1 ] :
                          ORDINAL_TICK_MARKS[ tickMarkNumber ];

    const useExactTickMarkValues = this.tickMarkViewProperty.value === TickMarkView.VISIBLE_WITH_UNITS;

    if ( remainder === TOTAL_RANGE.min ) {
      if ( inZeroCase ) {
        relativePosition = RatioAndProportionStrings.a11y.tickMark.relative.at;

        tickMarkDisplayedNumber = zeroString;
        ordinalPosition = null;
      }
      else {
        relativePosition = RatioAndProportionStrings.a11y.tickMark.relative.on;
      }
    }
    else if ( remainder <= 0.2 ) {
      if ( inZeroCase ) {
        relativePosition = RatioAndProportionStrings.a11y.tickMark.relative.near;

        tickMarkDisplayedNumber = zeroString;
        ordinalPosition = null;
      }
      else {
        relativePosition = RatioAndProportionStrings.a11y.tickMark.relative.around;
      }
    }
    else if ( remainder <= ROUND_DOWN_THRESHOLD ) {
      // handle these middle cases differently depending on current tickMarkView

      tickMarkDisplayedNumber += 0.5; // For these middle values, add .5

      if ( remainder < 0.5 ) {
        relativePosition = useExactTickMarkValues ? RatioAndProportionStrings.a11y.tickMark.relative.almostOn :
                           inZeroCase ? RatioAndProportionStrings.a11y.tickMark.relative.almostHalfwayTo :
                           RatioAndProportionStrings.a11y.tickMark.relative.almostHalfwayPast;
      }
      else if ( remainder === 0.5 ) {

        // If showing numbers, then the description looks like "on 2.5" instead of "half-way past second"
        relativePosition = useExactTickMarkValues ? RatioAndProportionStrings.a11y.tickMark.relative.on :
                           inZeroCase ? RatioAndProportionStrings.a11y.tickMark.relative.halfwayTo :
                           RatioAndProportionStrings.a11y.tickMark.relative.halfwayPast;
      }
      else if ( remainder <= ROUND_DOWN_THRESHOLD ) {
        relativePosition = useExactTickMarkValues ? RatioAndProportionStrings.a11y.tickMark.relative.around :
                           inZeroCase ? RatioAndProportionStrings.a11y.tickMark.relative.aroundHalfwayTo :
                           RatioAndProportionStrings.a11y.tickMark.relative.aroundHalfwayPast;
      }
      else {
        assert && assert( false, 'all cases should be covered' );
      }
    }
    else if ( remainder < 1 ) {
      relativePosition = RatioAndProportionStrings.a11y.tickMark.relative.almostOn;
    }
    else {
      assert && assert( false, `unexpected remainder value: ${remainder}` );
    }

    assert && assert( ordinalPosition !== undefined, 'ordinal number not found' );

    assert && assert( relativePosition );
    return {
      tickMarkPosition: tickMarkDisplayedNumber,

      relativePosition: relativePosition!,
      ordinalPosition: ordinalPosition
    };
  }
}

ratioAndProportion.register( 'TickMarkDescriber', TickMarkDescriber );
export default TickMarkDescriber;