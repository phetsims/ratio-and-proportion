// Copyright 2020-2022, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio, with convenience functions
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Range from '../../../../dot/js/Range.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioTerm from './RatioTerm.js';

type RAPRatioTupleState = {
  antecedent: number;
  consequent: number;
};

class RAPRatioTuple {

  antecedent: number;
  consequent: number;

  static RAPRatioTupleIO: IOType;
  static STATE_SCHEMA = {
    antecedent: NumberIO,
    consequent: NumberIO
  };

  constructor( antecedent: number, consequent: number ) {
    assert && assert( !isNaN( antecedent ) );
    assert && assert( !isNaN( consequent ) );

    this.antecedent = antecedent;
    this.consequent = consequent;
  }

  withAntecedent( antecedent: number ): RAPRatioTuple {
    return new RAPRatioTuple( antecedent, this.consequent );
  }

  withConsequent( consequent: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, consequent );
  }

  withValueForTerm( value: number, ratioTerm: RatioTerm ): RAPRatioTuple {
    return this.copy().setForTerm( value, ratioTerm );
  }

  plusAntecedent( antecedentDelta: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent + antecedentDelta, this.consequent );
  }

  plusConsequent( consequentDelta: number ): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, this.consequent + consequentDelta );
  }

  constrainFields( range: Range ): this {
    this.antecedent = range.constrainValue( this.antecedent );
    this.consequent = range.constrainValue( this.consequent );

    return this; // for chaining
  }

  getRatio(): number {
    return this.consequent === 0 ? Number.POSITIVE_INFINITY : this.antecedent / this.consequent;
  }

  /**
   * Get the distance between the two numbers
   * @returns {number} - greater than 0
   */
  getDistance(): number {
    return Math.abs( this.antecedent - this.consequent );
  }

  equals( otherRatioTuple: RAPRatioTuple ): boolean {
    return this.antecedent === otherRatioTuple.antecedent && this.consequent === otherRatioTuple.consequent;
  }

  getForTerm( ratioTerm: RatioTerm ): number {
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

  setForTerm( value: number, ratioTerm: RatioTerm ): this {
    switch( ratioTerm ) {
      case RatioTerm.ANTECEDENT:
        this.antecedent = value;
        break;
      case RatioTerm.CONSEQUENT:
        this.consequent = value;
        break;
      default:
        assert && assert( false, `unexpected ratioTerm ${ratioTerm}` );
    }
    return this;
  }

  copy(): RAPRatioTuple {
    return new RAPRatioTuple( this.antecedent, this.consequent );
  }

  toStateObject(): RAPRatioTupleState {
    return {
      antecedent: this.antecedent,
      consequent: this.consequent
    };
  }

  static fromStateObject( stateObject: RAPRatioTupleState ): RAPRatioTuple {
    return new RAPRatioTuple( stateObject.antecedent, stateObject.consequent );
  }
}

RAPRatioTuple.RAPRatioTupleIO = IOType.fromCoreType( 'RAPRatioTupleIO', RAPRatioTuple, {
  documentation: 'the basic data structure that holds both ratio term values, the antecedent and consequent.'
} );

ratioAndProportion.register( 'RAPRatioTuple', RAPRatioTuple );
export default RAPRatioTuple;
