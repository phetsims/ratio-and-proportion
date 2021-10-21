// Copyright 2020-2021, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio, with convenience functions
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Range from '../../../../dot/js/Range.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioTerm  from './RatioTerm.js';

class RAPRatioTuple {

  public antecedent: number;
  public consequent: number;

  public static RAPRatioTupleIO: IOType;
  public static STATE_SCHEMA: {
    antecedent: IOType,
    consequent: IOType
  };

  /**
   * @param {number} antecedent
   * @param {number} consequent
   */
  constructor( antecedent: number, consequent: number ) {
    assert && assert( !isNaN( antecedent ) );
    assert && assert( !isNaN( consequent ) );

    // @public {number}
    this.antecedent = antecedent;
    this.consequent = consequent;
  }

  /**
   * @param {number} antecedent
   * @returns {RAPRatioTuple}
   * @public
   */
  withAntecedent( antecedent: number ) {
    return new RAPRatioTuple( antecedent, this.consequent );
  }

  /**
   * @param {number} consequent
   * @returns {RAPRatioTuple}
   * @public
   */
  withConsequent( consequent: number ) {
    return new RAPRatioTuple( this.antecedent, consequent );
  }

  /**
   * @param {number} antecedentDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusAntecedent( antecedentDelta: number ) {
    return new RAPRatioTuple( this.antecedent + antecedentDelta, this.consequent );
  }

  /**
   * @param {number} consequentDelta
   * @returns {RAPRatioTuple}
   * @public
   */
  plusConsequent( consequentDelta: number ) {
    return new RAPRatioTuple( this.antecedent, this.consequent + consequentDelta );
  }

  /**
   * Constrain both data fields to a provided range
   * @public
   * @param {Range} range
   */
  constrainFields( range: Range ) {
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
  equals( otherRatioTuple: RAPRatioTuple ) {
    return this.antecedent === otherRatioTuple.antecedent && this.consequent === otherRatioTuple.consequent;
  }

  /**
   * @public
   * @param {RatioTerm} ratioTerm
   * @returns {number}
   */
  getForTerm( ratioTerm: RatioTerm ) {
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
  toStateObject( rapRatioTuple: RAPRatioTuple ) {
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
  static fromStateObject( stateObject: any ) {
    return new RAPRatioTuple( stateObject.antecedent, stateObject.consequent );
  }
}

RAPRatioTuple.STATE_SCHEMA = {
  antecedent: NumberIO,
  consequent: NumberIO
};

RAPRatioTuple.RAPRatioTupleIO = IOType.fromCoreType( 'RAPRatioTupleIO', RAPRatioTuple, {
  documentation: 'the basic data structure that holds both ratio term values, the antecedent and consequent.'
} );

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
