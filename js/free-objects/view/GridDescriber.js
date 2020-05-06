// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Util from '../../../../dot/js/Utils.js';
import designingProperties from '../../common/designingProperties.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class GridDescriber {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( valueRange ) {

    // @private
    this.valueRange = valueRange;

    // TODO: probably this means this is not a designing Property and should be refactored
    // @private
    this.gridBaseUnitProperty = designingProperties.gridBaseUnitProperty;
  }

  /**
   * @public
   * @param {Property.<number>} property
   * @returns {{grid: number, relativePosition: string}}
   */
  getRelativePositionAndGridNumberForProperty( property ) {
    assert && assert( this.valueRange.contains( property.value ) );

    const numberOfGridLines = this.gridBaseUnitProperty.value;

    const expandedValue = property.value * numberOfGridLines;

    const gridValue = Util.roundSymmetric( expandedValue );

    const remainder = expandedValue % 1;
    assert && assert( remainder < 1 && remainder >= 0 );

    let relativePosition = null;

    if ( remainder >= .5 && remainder <= .9 ) {
      relativePosition = ratioAndProportionStrings.a11y.grid.relative.below;
    }
    else if ( remainder > .1 && remainder < .5 ) {
      relativePosition = ratioAndProportionStrings.a11y.grid.relative.above;
    }
    else {
      relativePosition = ratioAndProportionStrings.a11y.grid.relative.inTheMiddleOf;
    }

    assert && assert( relativePosition );
    return {
      gridPosition: gridValue,
      relativePosition: relativePosition
    };
  }

}

ratioAndProportion.register( 'GridDescriber', GridDescriber );
export default GridDescriber;