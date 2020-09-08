// Copyright 2020, University of Colorado Boulder

/**
 * Description for the positions of each hand, as well as their positional relationship (like distance apart).
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import TickMarkView from './TickMarkView.js';

// constants
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

const DISTANCE_REGIONS_CAPITALIZED = [
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.farthestFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.veryFarFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.farFrom,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.notSoCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.somewhatCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.veryCloseTo,
  ratioAndProportionStrings.a11y.handPosition.distance.capitalized.extremelyCloseTo,
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
  ratioAndProportionStrings.a11y.handPosition.distance.lowercase.evenWith
];

assert && assert( DISTANCE_REGIONS_CAPITALIZED.length === DISTANCE_REGIONS_LOWERCASE.length, 'should be the same regions' );

const leftHandLowerString = ratioAndProportionStrings.a11y.leftHandLower;
const rightHandLowerString = ratioAndProportionStrings.a11y.rightHandLower;

class HandPositionsDescriber {

  /**
   * @param leftValueProperty
   * @param rightValueProperty
   * @param valueRange
   * @param {TickMarkDescriber} tickMarkDescriber
   */
  constructor( leftValueProperty, rightValueProperty, valueRange, tickMarkDescriber ) {

    // @private - from model
    this.leftValueProperty = leftValueProperty;
    this.rightValueProperty = rightValueProperty;
    this.valueRange = valueRange;
    this.tickMarkDescriber = tickMarkDescriber;

    // @private
    this.previousLeftValueProperty = new NumberProperty( leftValueProperty.value );
    this.previousRightValueProperty = new NumberProperty( rightValueProperty.value );

    // @private - initialized to null, but only set to boolean
    this.previousLeftChangeProperty = new Property( null );
    this.previousRightChangeProperty = new Property( null );
  }

  /**
   * only ends with "of Play Area" if qualitative
   * @public
   * @param {NumberProperty} valueProperty
   * @param {TickMarkView} tickMarkView
   * @param {boolean} useOfPlayArea - whether the position should end with "of Play Area", like "at bottom of Play Area"
   * @returns {string}
   */
  getHandPosition( valueProperty, tickMarkView, useOfPlayArea = true ) {
    if ( TickMarkView.describeQualitative( tickMarkView ) ) {
      const handPosition = this.getQualitativeHandPosition( valueProperty );
      return !useOfPlayArea ? handPosition : StringUtils.fillIn( ratioAndProportionStrings.a11y.ofPlayAreaPattern, {
        position: handPosition
      } );
    }
    else {
      return this.getQuantitativeHandPosition( valueProperty, TickMarkView.describeSemiQualitative( tickMarkView ) );
    }
  }

  /**
   * @private
   * @param {NumberProperty} valueProperty
   * @param {boolean} semiQuantitative=false
   * @returns {string}
   */
  getQuantitativeHandPosition( valueProperty, semiQuantitative = false ) {
    const tickMarkData = this.tickMarkDescriber.getRelativePositionAndTickMarkNumberForProperty( valueProperty );

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
   * @param {Property.<number>} property
   * @returns {string}
   */
  getQualitativeHandPosition( property ) {
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

  /**
   * @private
   * @returns {number}
   */
  getDistanceBetweenHands() {
    return Math.abs( this.leftValueProperty.value - this.rightValueProperty.value );
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
    else if ( distance >= .8 ) {
      index = 1;
    }
    else if ( distance >= .6 ) {
      index = 2;
    }
    else if ( distance >= .4 ) {
      index = 3;
    }
    else if ( distance >= .3 ) {
      index = 4;
    }
    else if ( distance >= .2 ) {
      index = 5;
    }
    else if ( distance >= .05 ) {
      index = 6;
    }
    else if ( distance > 0 ) {
      index = 7;
    }
    else if ( distance === 0 ) {
      index = 8;
    }
    assert && assert( index < DISTANCE_REGIONS_CAPITALIZED.length, 'out of range' );
    return ( lowercase ? DISTANCE_REGIONS_LOWERCASE : DISTANCE_REGIONS_CAPITALIZED )[ index ];
  }

  /**
   * @public
   * @param {NumberProperty} valueProperty
   * @returns {string}
   */
  getDistanceClauseForProperty( valueProperty ) {

    const previousValueProperty = valueProperty === this.leftValueProperty ? this.previousLeftValueProperty : this.previousRightValueProperty;
    const previousChangeProperty = valueProperty === this.leftValueProperty ? this.previousLeftChangeProperty : this.previousRightChangeProperty;
    const otherValueProperty = valueProperty === this.leftValueProperty ? this.rightValueProperty : this.leftValueProperty;
    const otherHand = valueProperty === this.leftValueProperty ? rightHandLowerString : leftHandLowerString;

    const increasing = valueProperty.value > previousValueProperty.value;
    const directionChange = increasing !== previousChangeProperty.value;

    let prefix = null;

    if ( directionChange && // if the direction changed
         valueProperty.value !== otherValueProperty.value && // if the two value positions are the same
         valueProperty.value !== previousValueProperty.value ) { // if the value position didn't change
      const otherValueLarger = otherValueProperty.value > valueProperty.value;
      prefix = increasing === otherValueLarger ? ratioAndProportionStrings.a11y.handPosition.closerTo :
               ratioAndProportionStrings.a11y.handPosition.fartherFrom;
    }
    else {
      prefix = this.getDistanceRegion();
    }

    previousValueProperty.value = valueProperty.value;
    previousChangeProperty.value = increasing;

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.handPosition.distanceOrDirectionClause, {
      otherHand: otherHand,
      distanceOrDirection: prefix
    } );
  }

  /**
   * @public
   * @param tickMarkView
   * @returns {string}
   */
  getBothHandsDistance( tickMarkView ) {
    const distance = TickMarkView.describeQualitative( tickMarkView ) ? this.getDistanceRegion( true ) :
                     this.tickMarkDescriber.getDistanceInTickMarks( tickMarkView, this.getDistanceBetweenHands() );
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.handsDistancePattern, {
      distance: distance
    } );
  }
}

ratioAndProportion.register( 'HandPositionsDescriber', HandPositionsDescriber );
export default HandPositionsDescriber;