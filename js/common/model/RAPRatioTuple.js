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

    // @public {number}
    this.numerator = numerator;
    this.denominator = denominator;
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
