// Copyright 2020, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RAPRatioTuple {

  /**
   * @param {number} numerator
   * @param {number} denominator
   */
  constructor( numerator, denominator ) {
    assert && assert( typeof numerator === 'number' && !isNaN( numerator ) );
    assert && assert( typeof denominator === 'number' && !isNaN( denominator ) );

    // @public {number}
    this.numerator = Utils.toFixedNumber( numerator, 6 );
    this.denominator = Utils.toFixedNumber( denominator, 6 );
  }

  /**
   *
   * @param {number} numerator
   * @returns {RAPRatioTuple}
   * @public
   */
  withNumerator( numerator ) {
    return new RAPRatioTuple( numerator, this.denominator );
  }

  /**
   *
   * @param {number} denominator
   * @returns {RAPRatioTuple}
   * @public
   */
  withDenominator( denominator ) {
    return new RAPRatioTuple( this.numerator, denominator );
  }

  /**
   * @param {number} numeratorDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusNumerator( numeratorDelta ) {
    return new RAPRatioTuple( this.numerator + numeratorDelta, this.denominator );
  }

  /**
   * @param {number} denominatorDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusDenominator( denominatorDelta ) {
    return new RAPRatioTuple( this.numerator, this.denominator + denominatorDelta );
  }

  /**
   * Constrain both data fields to a provided range
   * @public
   * @param {Range} valueRange
   */
  constrainFields( valueRange ) {
    this.numerator = valueRange.constrainValue( this.numerator );
    this.denominator = valueRange.constrainValue( this.denominator );

    return this; // for chaining
  }

  /**
   * @public
   * @returns {number}
   */
  getRatio() {
    return this.numerator / this.denominator;
  }

  /**
   * @public
   * @param numberOfDigits
   * @returns {RAPRatioTuple} - for chaining
   */
  toFixed( numberOfDigits ) {
    this.numerator = Utils.toFixedNumber( this.numerator, numberOfDigits );
    this.denominator = Utils.toFixedNumber( this.denominator, numberOfDigits );
    return this;
  }
}

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
