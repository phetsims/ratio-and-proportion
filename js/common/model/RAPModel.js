// Copyright 2020, University of Colorado Boulder

/**
 * This is the main model for the ratio in this sim. It has a RAPRatio, with its antecedent and consequent tuple, and
 * add to it a target ratio value, as well as a fitness of how close the current ratio (stored in the RAPRatio instance)
 * is to the target. In general use RAPRatio.ratioFitnessProperty (ranged from 0-1) to determine if you are far or close
 * to the target, respectively. See implementation-notes.md for more information.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
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

    // @public - the current state of the ratio (value of terms, if its locked, etc)
    this.ratio = new RAPRatio( .2, .4 );

    // @public - The desired ratio of the antecedent as compared to the consequent. As in 1:2. Initialized to default ratio
    // so that we always start in-proportion.
    this.targetRatioProperty = new NumberProperty( this.ratio.currentRatio );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. Max is RATIO_FITNESS_RANGE.max, but the min depends on the range of the
    // ratio terms (see RAPRatio), and the current targetRatio value. Thus using this Property should likely be used with
    // `RAPModel.getMinFitness()`. In most cases, this should not be used, since it isn't normalized. See
    // `this.ratioFitnessProperty` for the preferred method of monitoring ratio fitness. This Property can be useful
    // if you need to map feedback based on the entire range of fitness, and not just when the current ratio gets
    // "close enough" to the target (since negative values in this Property are all clamped to 0 in this.ratioFitnessProperty).
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
        unclampedFitness = RAPConstants.RATIO_FITNESS_RANGE.max - this.getInProportionThreshold() - .01;
      }

      phet.log && phet.log( `
left: ${antecedent}, 
right: ${consequent}, 
distance: ${Math.abs( consequent - antecedent )}, 
current ratio: ${this.ratio.currentRatio}, 
target ratio: ${this.targetRatioProperty.value},
unclampedFitness: ${unclampedFitness}
`
      );
      console.log( 'unclampedFitness = ' + unclampedFitness );

      return unclampedFitness;
    }, {
      isValidValue: value => value <= RAPConstants.RATIO_FITNESS_RANGE.max
    } );

    // @public {DerivedProperty.<number>}
    // How "correct" the proportion currently is. clamped within RATIO_FITNESS_RANGE. If at max (1), the proportion of
    // the two ratio terms is exactly the value of the targetRatioProperty. If min (0), it is at or outside the tolerance
    // threshold for some feedback in the view (like color/sound); in that case those will be omitted until the ratio is
    // closer to the target. In general, this Property should be used to listen to the fitness of the current ratio. It
    // is preferable to the unclampedFitnessProperty because it is normalized, and simpler when comparing the current ratio
    // to the target ratio.
    this.ratioFitnessProperty = new DerivedProperty( [ this.unclampedFitnessProperty ],
      unclampedFitness => Utils.clamp( unclampedFitness, RAPConstants.RATIO_FITNESS_RANGE.min, RAPConstants.RATIO_FITNESS_RANGE.max ), {
        isValidValue: value => RAPConstants.RATIO_FITNESS_RANGE.contains( value )
      } );

    // This must be done here, because of the reentrant nature of how fitness changes when the ratio is locked
    this.targetRatioProperty.link( () => {
      this.ratio.lockedProperty.value = false;
    } );

    // snap to target ratio when the ratio is locked.
    this.ratio.lockedProperty.link( locked => locked && this.ratio.setRatioToTarget( this.targetRatioProperty.value ) );
  }

  /**
   * This fitness algorithm is explained in https://github.com/phetsims/ratio-and-proportion/issues/325. It is based
   * on plotting the perpendicular intersection between a point representing the current ratio, and the function of the
   * target ratio. This is possible because the ratio term values are normalized between 0 and 1
   * (see RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE).
   * @param {number} antecedent
   * @param {number} consequent
   * @param {number} targetRatio
   * @returns {number}
   * @private
   */
  calculateFitness( antecedent, consequent, targetRatio ) {

    // Calculate the inverse slope from the current target ratio.
    const coefficient = -1 / targetRatio;

    const yIntercept = antecedent - consequent * coefficient;

    const pointOnTarget = Utils.lineLineIntersection(
      Vector2.ZERO, new Vector2( 1, targetRatio ), // line for the target ratio
      new Vector2( 0, yIntercept ), new Vector2( 1, coefficient + yIntercept ) // line for the inverse slope of target
    );

    // Find the distance between the current ratio, and the calculated intersection with the target ratio function.
    const distanceFromTarget = new Vector2( consequent, antecedent ).distance( pointOnTarget );

    return RAPConstants.RATIO_FITNESS_RANGE.max - ( RAPConstants.RATIO_FITNESS_RANGE.max * distanceFromTarget ) / ( MIN_CLAMPED_FITNESS_DISTANCE * targetRatio );
  }

  /**
   * Get the minimum fitness value (unclamped) for the provided target ratio, based on the range of the ratio terms.
   * @public
   * @param {number} ratio
   * @returns {number}
   */
  getMinFitness( ratio = this.targetRatioProperty.value ) {
    const minRatioFitness = Math.min( this.calculateFitness( TOTAL_RANGE.min, TOTAL_RANGE.max, ratio ),
      this.calculateFitness( TOTAL_RANGE.min, TOTAL_RANGE.min, ratio ) );
    const maxRatioFitness = Math.min( this.calculateFitness( TOTAL_RANGE.min, TOTAL_RANGE.max, ratio ),
      this.calculateFitness( TOTAL_RANGE.max, TOTAL_RANGE.max, ratio ) );
    return Math.min( minRatioFitness, maxRatioFitness );
  }

  /**
   * If either value is smaller than a threshold, then the fitness cannot be at its max, "in-proportion" state. This function
   * will return true when the model is in that state. When true, one or both value is too small to allow for a success state.
   * @public
   * @returns {boolean}
   */
  valuesTooSmallForInProportion() {
    const currentTuple = this.ratio.tupleProperty.value;
    return currentTuple.antecedent <= RAPConstants.NO_SUCCESS_VALUE_THRESHOLD ||
           currentTuple.consequent <= RAPConstants.NO_SUCCESS_VALUE_THRESHOLD;
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
    return fitness > RAPConstants.RATIO_FITNESS_RANGE.max - this.getInProportionThreshold();
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