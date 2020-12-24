// Copyright 2020, University of Colorado Boulder

// REVIEW: This is a pretty central class in the sim and should probably have a description.
/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import RAPRatio from './RAPRatio.js';
import RatioTerm from './RatioTerm.js';

// constant to help achieve feedback in 40% of the visual screen height (2 default tick marks). Calculated by taking the
// fitness distance when the right hand is 2 tick marks from the target ratio. This number is based on a target ratio of
// .5, so it is normalized here. When used, it should be multiplied by the current target ratio.
const MIN_CLAMPED_FITNESS_DISTANCE = 0.08944271909999162 / .5;

const TOTAL_RANGE = RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class RAPModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public - The desired ratio of the antecedent as compared to the consequent. As in 1:2 (initial value).
    this.targetRatioProperty = new NumberProperty( .5 );

    // REVIEW: The target ratio property (above) and the ratio (below) rely on hard-coded constants to be correctly
    // REVIEW: initialized.  Why not construct the ratio with values, then use its currentRatio to initialize targetRatioProperty?

    // @public - the current state of the ratio (value of terms, if its locked, etc)
    this.ratio = new RAPRatio();

    // REVIEW - The rest of the code doesn't seem to ever change fitnessRange.  Can it be a constant and a static?
    // @public (read-only) - the Range that the ratioFitnessProperty can be.
    this.fitnessRange = new Range( 0, 1 );

    // REVIEW: The comment below says, in part, "the min can be arbitrarily negative, depending how far away the current
    // ratio is from the targetRatio".  The phrase "arbitrarily negative" seems problematic.  It can't really be
    // arbitrary if it's the result of a calculation, which it almost certainly is.  What calculation?  How negative?
    // How are clients expected to interpret these negative values?

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Max is this.fitnessRange.max, but the min can be arbitrarily negative,
    // depending how far away the current ratio is from the targetRatio
    this.unclampedFitnessProperty = new DerivedProperty( [
      this.ratio.tupleProperty,
      this.targetRatioProperty
    ], ( ratioTuple, ratio ) => {

      const antecedent = ratioTuple.antecedent;
      const consequent = ratioTuple.consequent;

      let unclampedFitness = this.calculateFitness( antecedent, consequent, ratio );

      if ( this.inProportion( unclampedFitness ) &&

           // If either value is small enough, then we don't allow an "in proportion" fitness level, so make it just below
           // that threshold.
           ( this.valuesTooSmallForInProportion() ||

             // In this case, the normal model behavior looks buggy because both values are equal, but still in proportion.
             this.ratioEvenButNotAtTarget() ) ) {
        unclampedFitness = this.fitnessRange.max - this.getInProportionThreshold() - .01;
      }

      // REVIEW: This looks weird in terms of indentation.  Why not use \n or <br> and the + operator to keep it neater?
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

    // REVIEW: Somewhere it should be explained why the clamped and unclamped values are both needed.

    // REVIEW: Suggest more consistent names for fitness properties, e.g. clampedRatioFitnessProperty and unclampedRatioFitnessProperty

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. clamped within this.fitnessRange. If at max (1), the proportion of
    // the two values is exactly the value of the targetRatioProperty. If min (0), it is outside the tolerance
    // allowed for the proportion to give many feedbacks.
    // REVIEW: "...it is outside the tolerance allowed for the proportion to give many feedbacks." -> Can this be clarified and/or reworded?
    this.ratioFitnessProperty = new DerivedProperty( [ this.unclampedFitnessProperty ],
      unclampedFitness => Utils.clamp( unclampedFitness, this.fitnessRange.min, this.fitnessRange.max ), {
        isValidValue: value => this.fitnessRange.contains( value )
      } );

    // This must be done here, because of the reentrant nature of how fitness changes when the ratio is locked
    this.targetRatioProperty.link( () => {
      this.ratio.lockedProperty.value = false;
    } );

    // snap to target ratio when the ratio is locked.
    this.ratio.lockedProperty.link( locked => locked && this.ratio.setRatioToTarget( this.targetRatioProperty.value ) );
  }

  // REVIEW: Suggest adding an explanation somewhere of how the fitness value works.

  /**
   * This fitness algorithm is explained in https://github.com/phetsims/ratio-and-proportion/issues/325. It is based
   * on plotting and intersection between a point representing the current ratio, and the function of the current ratio.
   * This is possible because the ratio values are normalized between 0 and 1.
   * @param {number} antecedent
   * @param {number} consequent
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  calculateFitness( antecedent, consequent, targetRatio ) {

    // REVIEW: The comment below says, in part, "...because the model values only span from 0-1".  This is the first
    // time this is mentioned that this reviewer (jbphet) has encountered.  Is this a constraint of the model?  Is it
    // enforced anywhere?  Why is it like this?  Also, why is it necessary to multiply by any number?  A ratio is a
    // ratio, so it seems kind of odd.

    // Calculate the inverse slope from the current target ratio.
    const coefficient = -1 / targetRatio;

    const yIntercept = antecedent - consequent * coefficient;

    const pointOnTarget = Utils.lineLineIntersection(
      Vector2.ZERO, new Vector2( 1, targetRatio ), // line for the target ratio
      new Vector2( 0, yIntercept ), new Vector2( 1, coefficient + yIntercept ) // line for the inverse slope of target
    );

    // Find the distance between the current ratio, and the calculated intersection with the target ratio function.
    const distanceFromTarget = new Vector2( consequent, antecedent ).distance( pointOnTarget );

    return this.fitnessRange.max - ( this.fitnessRange.max * distanceFromTarget ) / ( MIN_CLAMPED_FITNESS_DISTANCE * targetRatio );
  }

  /**
   * Get the minimum fitness value (unclamped) for the provided target ratio, based on the range of the ratio terms.
   * @public
   * @param {number} ratio
   * @returns {number}
   */
  getMinFitness( ratio = this.targetRatioProperty.value ) {
    const minRatioFitness = this.calculateFitness( TOTAL_RANGE.min, TOTAL_RANGE.max, ratio );
    const maxRatioFitness = this.calculateFitness( TOTAL_RANGE.max, TOTAL_RANGE.min, ratio );
    return Math.min( minRatioFitness, maxRatioFitness );
  }

  /**
   * If either value is smaller than a threshold, then the fitness cannot be at its max, "in-proportion" state. This function
   * will return true when the model is in that state. When true, one or both value is too small to allow for a success state.
   * @public
   * @returns {boolean}
   */
  valuesTooSmallForInProportion() {
    return this.ratio.antecedentProperty.value <= RAPConstants.NO_SUCCESS_VALUE_THRESHOLD ||
           this.ratio.consequentProperty.value <= RAPConstants.NO_SUCCESS_VALUE_THRESHOLD;
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
   * @param {RatioTerm} ratioTerm
   * @returns {number}
   * @public
   */
  getIdealValueForTerm( ratioTerm ) {
    if ( ratioTerm === RatioTerm.ANTECEDENT ) {
      return this.targetRatioProperty.value * this.ratio.tupleProperty.value.consequent;
    }
    if ( ratioTerm === RatioTerm.CONSEQUENT ) {
      return this.ratio.tupleProperty.value.antecedent / this.targetRatioProperty.value;
    }
  }

  /**
   * A special case in the model where the target ratio is not 1, but both ratio terms are even. This case is worth
   * its own function because it often produces weird bugs in the view's output, see https://github.com/phetsims/ratio-and-proportion/issues/297 and https://github.com/phetsims/ratio-and-proportion/issues/299
   * @returns {boolean}
   * @public
   */
  ratioEvenButNotAtTarget() {
    return this.targetRatioProperty.value !== 1 &&
           this.ratio.tupleProperty.value.antecedent === this.ratio.tupleProperty.value.consequent;
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {
    this.ratio.reset(); // do this first

    this.targetRatioProperty.reset();
  }
}

ratioAndProportion.register( 'RAPModel', RAPModel );
export default RAPModel;