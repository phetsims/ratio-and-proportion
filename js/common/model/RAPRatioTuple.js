// Copyright 2020, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RAPRatioTuple {

  /**
   * @param {number} antecedent
   * @param {number} consequent
   */
  constructor( antecedent, consequent ) {
    assert && assert( typeof antecedent === 'number' && !isNaN( antecedent ) );
    assert && assert( typeof consequent === 'number' && !isNaN( consequent ) );

    // @public {number}
    this.antecedent = Utils.toFixedNumber( antecedent, 6 );
    this.consequent = Utils.toFixedNumber( consequent, 6 );
  }

  /**
   *
   * @param {number} antecedent
   * @returns {RAPRatioTuple}
   * @public
   */
  withAntecedent( antecedent ) {
    return new RAPRatioTuple( antecedent, this.consequent );
  }

  /**
   *
   * @param {number} consequent
   * @returns {RAPRatioTuple}
   * @public
   */
  withConsequent( consequent ) {
    return new RAPRatioTuple( this.antecedent, consequent );
  }

  /**
   * @param {number} antecedentDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusAntecedent( antecedentDelta ) {
    return new RAPRatioTuple( this.antecedent + antecedentDelta, this.consequent );
  }

  /**
   * @param {number} consequentDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusConsequent( consequentDelta ) {
    return new RAPRatioTuple( this.antecedent, this.consequent + consequentDelta );
  }

  /**
   * Constrain both data fields to a provided range
   * @public
   * @param {Range} valueRange
   */
  constrainFields( valueRange ) {
    this.antecedent = valueRange.constrainValue( this.antecedent );
    this.consequent = valueRange.constrainValue( this.consequent );

    return this; // for chaining
  }

  /**
   * @public
   * @returns {number}
   */
  getRatio() {
    return this.antecedent / this.consequent;
  }

  /**
   * Get the distance between the two numbers
   * @public
   * @returns {number} - greater than 0
   */
  getDistance() {
    return Math.abs( this.antecedent - this.consequent );
  }

  /**
   * @public
   * @param numberOfDigits
   * @returns {RAPRatioTuple} - for chaining
   */
  toFixed( numberOfDigits ) {
    this.antecedent = Utils.toFixedNumber( this.antecedent, numberOfDigits );
    this.consequent = Utils.toFixedNumber( this.consequent, numberOfDigits );
    return this;
  }
}

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
