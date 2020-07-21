// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

// constants
const RELATIVE_POSITION_STRINGS = [
  ratioAndProportionStrings.a11y.grid.relative.on,
  ratioAndProportionStrings.a11y.grid.relative.justAbove,
  ratioAndProportionStrings.a11y.grid.relative.above,
  ratioAndProportionStrings.a11y.grid.relative.inTheMiddleOf,
  ratioAndProportionStrings.a11y.grid.relative.below,
  ratioAndProportionStrings.a11y.grid.relative.justBelow
];

const BIGGER_THAN_MIDDLE_THRESHOLD = .6;

class GridDescriber {

  /**
   * @param {Range} valueRange
   * @param {Property.<number>} gridRangeProperty
   */
  constructor( valueRange, gridRangeProperty ) {

    // @private
    this.valueRange = valueRange;
    this.gridRangeProperty = gridRangeProperty;
  }

  /**
   * Get a description of the vertical grid cell that the newPosition is in. So position within vertical grid lines
   * 0 -> 1 will return 0. From grid lines 1 -> 2, will return 1 and so on.
   * @public
   *
   * @param newPosition
   * @returns {number}
   */
  getFlooredGridPosition( newPosition ) {
    assert && assert( this.valueRange.contains( newPosition ) );

    const numberOfGridLines = this.gridRangeProperty.value;

    const expandedValue = newPosition * numberOfGridLines;
    return Math.floor( expandedValue );
  }

  /**
   * @public
   * @param {Property.<number>} property
   * @returns {{grid: number, relativePosition: string}}
   */
  getRelativePositionAndGridNumberForProperty( property ) {
    assert && assert( this.valueRange.contains( property.value ) );

    const numberOfGridLines = this.gridRangeProperty.value;

    // account for javascript rounding error
    const expandedValue = Utils.toFixedNumber( property.value * numberOfGridLines, 6 );

    // account for javascript rounding error
    const remainder = Utils.toFixedNumber( expandedValue % 1, 6 );
    assert && assert( remainder < 1 && remainder >= 0 );

    const relativePosition = this.getRelativePosition( remainder );

    const gridValue = remainder >= BIGGER_THAN_MIDDLE_THRESHOLD ? Math.ceil( expandedValue ) : Math.floor( expandedValue );

    assert && assert( relativePosition );
    return {
      gridPosition: gridValue,
      relativePosition: relativePosition
    };
  }

  /**
   * @private
   * @param {number} value - must be in range [0,1) (not including 1). Basically this is the "remainder" position in
   * between two grid lines
   * @returns {string} the relative position given the position from a grid line.
   */
  getRelativePosition( value ) {
    assert && assert( RELATIVE_POSITION_STRINGS.length === 6, '6 regions expected' );
    assert && assert( value < 1 && value >= 0, 'value not in range' );

    let index = null;
    // TODO: is exactly 0 too strict? My guess is yes, and we maybe want to compare to valueRange.min so that the bottom 0 marker ends up being no-fitness
    if ( value === 0 ) {
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

      // Use the constant "BIGGER_THAN_MIDDLE_THRESHOLD" to make sure that "in the middle of" refers to the grid line below, and everything higher refers to
      // the next grid line up.
      assert && assert( RELATIVE_POSITION_STRINGS[ 3 ].toLowerCase().includes( 'middle' ), 'this middle position should be the previous' );
      index = 4;
    }
    else if ( value < 1 ) {
      index = 5;
    }
    assert && assert( typeof index === 'number' );
    return RELATIVE_POSITION_STRINGS[ index ];
  }
}

ratioAndProportion.register( 'GridDescriber', GridDescriber );
export default GridDescriber;