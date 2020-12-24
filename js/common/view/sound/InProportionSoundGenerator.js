// Copyright 2020, University of Colorado Boulder

/**
 * A short but sustained note that plays when the ratio becomes "in proportion". This type has built-in functionality to allow the
 * note to sustain if in-proportion, but will quickly quiet when no longer "in proportion".
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import inProportionSound from '../../../../sounds/in-proportion/in-proportion_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

const SUCCESS_OUTPUT_LEVEL = .8;
const SILENT_LEVEL = 0;

// The distance that you must move away from being in Proportion until you can then come back in proportion and get a
// success sound to play. See InProportionSoundGenerator. In "fitness" units, so the default value is a space of 10%
// of the fitness range.
const HYSTERESIS_THRESHOLD = .1;

class InProportionSoundGenerator extends SoundClip {

  /**
   * @param {RAPModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    options = merge( {
      initialOutputLevel: .5
    }, options );

    super( inProportionSound, options );

    // @private
    this.model = model;
    this.targetRatioProperty = model.targetRatioProperty;
    this.fitnessProperty = model.ratioFitnessProperty;

    // @private - keep track of if the success sound has already played. This will be set back to false when the fitness
    // goes back out of range for the success sound.
    this.playedSuccessYet = false;

    // @private {boolean} - True when, in the previous step, the current ratio (calculated from currentRatio) is larger than
    // the target ratio.
    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();

    // @private {boolean} - true when, in the previous step, either term of the ratio was too small to indicate success.
    this.previousRatioWasTooSmallForSuccess = this.model.valuesTooSmallForInProportion();

    // @private - in certain cases ratio hand positions can move so quickly "through" the in-proportion range that an
    // actual "in proportion" value is never set. When this boolean is true, then this SoundGenerator will note when
    // this "jump over in proportion" occurs, and still play the sound. This is useful for mouse interaction, but not
    // so much for keyboard interaction. See https://github.com/phetsims/ratio-and-proportion/issues/162
    this.jumpingOverShouldSound = false;
  }

  /**
   * @private
   * @returns {boolean}
   */
  calculateCurrentRatioLargerThanTarget() {
    return this.model.ratio.currentRatio > this.model.targetRatioProperty.value;
  }

  /**
   * When true, the InProportionSoundGenerator will play when the ratio "jumps" over in proportion in two consecutive
   * values of the current ratio.
   * @public
   * @param {boolean} jumpingOverShouldSound
   */
  setJumpingOverProportionShouldTriggerSound( jumpingOverShouldSound ) {
    this.jumpingOverShouldSound = jumpingOverShouldSound;
  }

  /**
   * True when the ratio jumped over being in proportion, but it should still sound that it was in proportion.
   *
   * This can only occur when current and previous ratio terms were not in the "too small for success" region.
   * @private
   * @returns {boolean}
   */
  jumpedOverInProportionAndShouldSound() {
    return this.jumpingOverShouldSound &&
           !this.model.valuesTooSmallForInProportion() && !this.previousRatioWasTooSmallForSuccess &&
           this.calculateCurrentRatioLargerThanTarget() !== this.previousRatioWasLargerThanTarget;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    const newFitness = this.fitnessProperty.value;

    const isInRatio = this.model.inProportion();

    // Only use hysteresis when both hands are moving.
    const hysteresisThreshold = this.model.ratio.movingInDirection() ? HYSTERESIS_THRESHOLD : 0;

    if ( !this.playedSuccessYet &&
         ( isInRatio || this.jumpedOverInProportionAndShouldSound() ) &&
         !this.model.ratioEvenButNotAtTarget()  // don't allow this sound if target isn't 1 but both values are 1
    ) {
      this.setOutputLevel( SUCCESS_OUTPUT_LEVEL, 0 );
      this.play();
      this.playedSuccessYet = true;
    }
    else if ( this.playedSuccessYet && newFitness < 1 - this.model.getInProportionThreshold() - hysteresisThreshold ) {

      // The fitness has gone away from being in proportion enough that you can now get the sound again
      this.playedSuccessYet = false;
    }

    // if we were in ratio, but now we are not, then fade out the
    if ( !isInRatio && this.outputLevel !== SILENT_LEVEL ) {
      this.setOutputLevel( SILENT_LEVEL, .1 );
    }

    // for testing during next step()
    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
    this.previousRatioWasTooSmallForSuccess = this.model.valuesTooSmallForInProportion();
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.stop();
    this.playedSuccessYet = false;
    this.previousRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
  }
}

ratioAndProportion.register( 'InProportionSoundGenerator', InProportionSoundGenerator );

export default InProportionSoundGenerator;