// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship (like distance apart).
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import GridView from './GridView.js';

// constants
const QUALITATIVE_POSITIONS = [
  ratioAndProportionStrings.a11y.pointerPosition.atBottom,
  ratioAndProportionStrings.a11y.pointerPosition.nearBottom,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatNearBottom,
  ratioAndProportionStrings.a11y.pointerPosition.justBelowMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.atMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.justAboveMiddle,
  ratioAndProportionStrings.a11y.pointerPosition.somewhatNearTop,
  ratioAndProportionStrings.a11y.pointerPosition.nearTop,
  ratioAndProportionStrings.a11y.pointerPosition.atTop
];

class HandPositionsDescriber {

  /**
   * @param leftValueProperty
   * @param rightValueProperty
   * @param valueRange
   * @param {GridDescriber} gridDescriber
   */
  constructor( leftValueProperty, rightValueProperty, valueRange, gridDescriber ) {

    // @private - from model
    this.leftValueProperty = leftValueProperty;
    this.rightValueProperty = rightValueProperty;
    this.valueRange = valueRange;
    this.gridDescriber = gridDescriber;
  }

  /**
   * @param {GridView} gridView
   * @returns {string}
   * @public
   */
  getBothHandsPositionText( gridView ) {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHandsValuetext, {
      leftPosition: this.getHandPosition( this.leftValueProperty, gridView ),
      rightPosition: this.getHandPosition( this.rightValueProperty, gridView )
    } );
  }

  /**
   * only ends with "of Play Area" if qualitative
   * @public
   * @param {NumberProperty} valueProperty
   * @param {GridView} gridView
   * @returns {string}
   */
  getHandPosition( valueProperty, gridView ) {
    if ( GridView.describeQualitative( gridView ) ) {

      return StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
        position: this.getQualitativePointerPosition( valueProperty )
      } );
    }
    else {
      return this.getQuantitativePointerPosition( valueProperty );
    }
  }

  /**
   * @private
   * @param {NumberProperty} valueProperty
   * @returns {string}
   */
  getQuantitativePointerPosition( valueProperty ) {
    const gridObject = this.gridDescriber.getRelativePositionAndGridNumberForProperty( valueProperty );
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.grid.quantitativeHandPositionPattern, {
      relativePosition: gridObject.relativePosition,
      gridPosition: gridObject.gridPosition
    } );
  }

  /**
   * @private
   * @param {Property.<number>} property
   * @returns {string}
   */
  getQualitativePointerPosition( property ) {
    return QUALITATIVE_POSITIONS[ this.getQualitativePositionIndex( property.value ) ];
  }

  /**
   * @param {number} position - within this.valueRange
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
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;