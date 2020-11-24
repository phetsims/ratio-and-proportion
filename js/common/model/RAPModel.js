// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import RAPRatio from './RAPRatio.js';
import RatioComponent from './RatioComponent.js';

// constant to help achieve feedback in 40% of the visual screen height.
const FITNESS_TOLERANCE_FACTOR = 0.5;

// The value in which when either the antecedent or consequent is less than this, the ratio cannot be "in proportion".
// Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
const NO_SUCCUSS_VALUE_THRESHOLD = .021;

const DEFAULT_RANGE = RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE;

class RAPModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // The desired ratio of the antecedent as compared to the consequent. As in 1:2 (initial value).
    this.targetRatioProperty = new NumberProperty( .5 );

    // @public - the current state of the ratio
    this.ratio = new RAPRatio();

    // @public (read-only) - the Range that the ratioFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Max is this.fitnessRange.max, but the min can be arbitrarily negative,
    // depending how far away the current
    this.unclampedFitnessProperty = new DerivedProperty( [
      this.ratio.ratioTupleProperty,
      this.targetRatioProperty
    ], ( ratioTuple, ratio ) => {

      const antecedent = ratioTuple.antecedent;
      const consequent = ratioTuple.consequent;

      let unclampedFitness = this.calculateFitness( antecedent, consequent, ratio );

      // If either value is small enough, then we don't allow an "in proportion" fitness level, so make it just below that threshold.
      if ( this.inProportion( unclampedFitness ) && this.valuesTooSmallForSuccess() ) {
        unclampedFitness = this.fitnessRange.max - this.getInProportionThreshold() - .01;
      }

      phet.log && phet.log( `
left: ${antecedent}, 
right: ${consequent}, 
distance: ${Math.abs( consequent - antecedent )}, 
current ratio: ${this.ratio.currentRatio}, 
target ratio: ${this.targetRatioProperty.value},
unclampedFitness: ${unclampedFitness}\n` );

      return unclampedFitness;
    }, {
      isValidValue: value => value <= this.fitnessRange.max
    } );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. clamped within this.fitnessRange. If at max (1), the proportion of the two values is
    // exactly the value of the targetRatioProperty. If min (0), it is outside the tolerance allowed for the proportion
    // to give many feedbacks.
    this.ratioFitnessProperty = new DerivedProperty( [ this.unclampedFitnessProperty ],
      unclampedFitness => Utils.clamp( unclampedFitness, this.fitnessRange.min, this.fitnessRange.max ), {
        isValidValue: value => this.fitnessRange.contains( value )
      } );

    // @public - true before and until first user interaction with the simulation. Reset will apply to this Property.
    this.firstInteractionProperty = new BooleanProperty( true );

    // This must be done here, because of the reentrant nature of how fitness changes when the ratio is locked
    this.targetRatioProperty.link( () => {
      this.ratio.lockedProperty.value = false;
    } );

    // snap to target ratio when the ratio is locked.
    this.ratio.lockedProperty.link( locked => locked && this.ratio.snapRatioToTarget( this.targetRatioProperty.value ) );
  }

  /**
   * fitness according to treating the consequent as "correct" in relation to the target ratio
   * @param {number} antecedent
   * @param {number} consequentOptimal
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  fitnessBasedOnAntecedent( antecedent, consequentOptimal, targetRatio ) {
    return 1 - FITNESS_TOLERANCE_FACTOR * Math.abs( antecedent - targetRatio * consequentOptimal );
  }

  /**
   * fitness according to treating the antecedent as "correct" in relation to the target ratio
   * @param {number} antecedentOptimal
   * @param {number} consequent
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  fitnessBasedOnConsequent( antecedentOptimal, consequent, targetRatio ) {
    return 1 - FITNESS_TOLERANCE_FACTOR * Math.abs( consequent - antecedentOptimal / targetRatio );
  }

  /**
   *
   * @param {number} antecedent
   * @param {number} consequent
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  calculateFitness( antecedent, consequent, targetRatio ) {

    // multiply because the model values only span from 0-1
    const a = antecedent * 10;
    const b = consequent * 10;
    return Math.min( this.fitnessBasedOnAntecedent( a, b, targetRatio ), this.fitnessBasedOnConsequent( a, b, targetRatio ) );
  }

  /**
   * Get the minimum fitness value (unclamped) for the provided target ratio
   * @public
   * @returns {number}
   */
  getMinFitness( ratio = this.targetRatioProperty.value ) {
    const minRatioFitness = this.calculateFitness( DEFAULT_RANGE.min, DEFAULT_RANGE.max, ratio );
    const maxRatioFitness = this.calculateFitness( DEFAULT_RANGE.max, DEFAULT_RANGE.min, ratio );
    return Math.min( minRatioFitness, maxRatioFitness );
  }

  /**
   * If either value is smaller than a threshold, then some model functionality changes. This function will return true
   * when the model is in that state. When true, one or both value is too small to allow for a success state.
   * @public
   * @returns {boolean}
   */
  valuesTooSmallForSuccess() {
    return this.ratio.antecedentProperty.value <= NO_SUCCUSS_VALUE_THRESHOLD || this.ratio.consequentProperty.value <= NO_SUCCUSS_VALUE_THRESHOLD;
  }

  /**
   * @public
   * @returns {number}
   */
  getInProportionThreshold() {
    let threshold = RAPConstants.IN_PROPORTION_FITNESS_THRESHOLD;
    if ( this.ratio.movingInDirection() ) {
      threshold = RAPConstants.MOVING_IN_PROPORTION_FITNESS_THRESHOLD;
    }
    return threshold;
  }

  /**
   * This is the sim's definition of if the ratio is in the "success" metric, what we call "in proportion." This changes
   * based on if moving in proportion (bimodal interaction), or not.
   * @public
   * @param {number} [fitness] - if provided, calculate if this fitness is in proportion
   * @returns {boolean}
   */
  inProportion( fitness = this.ratioFitnessProperty.value ) {
    return fitness > this.fitnessRange.max - this.getInProportionThreshold();
  }

  /**
   * @public
   * @override
   */
  step() {
    this.ratio.step();
  }

  /**
   * Given a ratio component (antecedent or consequent), determine what it should be to make the current ratio equal to
   * the target ratio.
   * @param {RatioComponent} ratioComponent
   * @returns {number}
   * @public
   */
  getIdealValueForTerm( ratioComponent ) {
    let theReturn = null;
    if ( ratioComponent === RatioComponent.ANTECEDENT ) {
      theReturn = this.targetRatioProperty.value * this.ratio.ratioTupleProperty.value.consequent;
    }
    if ( ratioComponent === RatioComponent.CONSEQUENT ) {
      theReturn = this.ratio.ratioTupleProperty.value.antecedent / this.targetRatioProperty.value;
    }
    return Utils.toFixedNumber( theReturn, 6 );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.ratio.reset(); // do this first

    this.targetRatioProperty.reset();
    this.firstInteractionProperty.reset();
  }
}

ratioAndProportion.register( 'RAPModel', RAPModel );
export default RAPModel;