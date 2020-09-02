// Copyright 2020, University of Colorado Boulder

/**
 * A short but sustained note that plays when the ratio becomes "in proportion"
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import fifthsOption2Sound from '../../../../sounds/in-proportion/in-proportion-fifths-option-2_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

const SUCCESS_OUTPUT_LEVEL = .8;
const SILENT_LEVEL = 0;


class InProportionSoundGenerator extends SoundClip {

  /**
   * @param {RatioAndProportionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    options = merge( {
      initialOutputLevel: .5
    }, options );
    super( fifthsOption2Sound, options );

    // @private
    this.model = model;
    this.currentRatioProperty = model.currentRatioProperty;
    this.rightValueProperty = model.rightValueProperty;
    this.targetRatioProperty = model.targetRatioProperty;
    this.fitnessProperty = model.ratioFitnessProperty;

    // @private - keep track of if the success sound has already played. This will be set back to false when the fitness
    // goes back out of range for the success sound.
    this.playedSuccessYet = false;

    // @private - True when, in the previous step, the current ratio (calculated from leftValue/rightValue) is larger than
    // the target ratio.
    this.currentRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
  }

  /**
   * @private
   * @returns {boolean}
   */
  calculateCurrentRatioLargerThanTarget() {
    return this.currentRatioProperty.value > this.model.targetRatioProperty.value;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    const newFitness = this.fitnessProperty.value;

    const isInRatio = this.model.inProportion();

    const currentRatioIsLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();

    // Only use hysteresis when both hands are moving.
    const hysteresisThreshold = this.model.movingInDirection() ? RatioAndProportionQueryParameters.hysteresisThreshold : 0;

    if ( !this.playedSuccessYet && ( isInRatio || currentRatioIsLargerThanTarget !== this.currentRatioWasLargerThanTarget ) ) {
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

    this.currentRatioWasLargerThanTarget = currentRatioIsLargerThanTarget;
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.stop();
    this.playedSuccessYet = false;
    this.currentRatioWasLargerThanTarget = this.calculateCurrentRatioLargerThanTarget();
  }
}

ratioAndProportion.register( 'InProportionSoundGenerator', InProportionSoundGenerator );

export default InProportionSoundGenerator;