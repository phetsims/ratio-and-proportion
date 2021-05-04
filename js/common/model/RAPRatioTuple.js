// Copyright 2020, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio, with convenience functions
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioTerm from './RatioTerm.js';

class RAPRatioTuple {

  /**
   * @param {number} antecedent
   * @param {number} consequent
   */
  constructor( antecedent, consequent ) {
    assert && assert( typeof antecedent === 'number' && !isNaN( antecedent ) );
    assert && assert( typeof consequent === 'number' && !isNaN( consequent ) );

    // @public {number}
    this.antecedent = antecedent;
    this.consequent = consequent;
  }

  /**
   * @param {number} antecedent
   * @returns {RAPRatioTuple}
   * @public
   */
  withAntecedent( antecedent ) {
    return new RAPRatioTuple( antecedent, this.consequent );
  }

  /**
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
   * @param {Range} range
   */
  constrainFields( range ) {
    this.antecedent = range.constrainValue( this.antecedent );
    this.consequent = range.constrainValue( this.consequent );

    return this; // for chaining
  }

  /**
   * @public
   * @returns {number}
   */
  getRatio() {
    return this.consequent === 0 ? Number.POSITIVE_INFINITY : this.antecedent / this.consequent;
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
   * @param {RAPRatioTuple} otherRatioTuple
   * @returns {boolean}
   */
  equals( otherRatioTuple ) {
    return this.antecedent === otherRatioTuple.antecedent && this.consequent === otherRatioTuple.consequent;
  }

  /**
   * @public
   * @param {RatioTerm} ratioTerm
   * @returns {number}
   */
  getForTerm( ratioTerm ) {
    switch( ratioTerm ) {
      case RatioTerm.ANTECEDENT:
        return this.antecedent;
      case RatioTerm.CONSEQUENT:
        return this.consequent;
      default:
        assert && assert( false, `unexpected ratioTerm ${ratioTerm}` );
        return -1;
    }
  }

  /**
   * @public
   * @returns {RAPRatioTuple}
   */
  copy() {
    return new RAPRatioTuple( this.antecedent, this.consequent );
  }

  /**
   * @public
   * @param {RAPRatioTuple} rapRatioTuple
   * @returns {Object}
   */
  toStateObject( rapRatioTuple ) {
    return {
      antecedent: this.antecedent,
      consequent: this.consequent
    };
  }

  /**
   * @public
   * @param {Object} stateObject see toStateObject
   * @returns {RAPRatioTuple}
   */
  static fromStateObject( stateObject ) {
    return new RAPRatioTuple( stateObject.antecedent, stateObject.consequent );
  }
}

RAPRatioTuple.RAPRatioTupleIO = IOType.fromCoreType( 'RAPRatioTupleIO', RAPRatioTuple, {
  documentation: 'the basic data structure that holds both ratio term values, the antecedent and consequent.'
} );

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
