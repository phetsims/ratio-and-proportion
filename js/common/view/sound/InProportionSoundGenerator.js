// Copyright 2020, University of Colorado Boulder

/**
 * TODO: isInteractingProperty should reset this.playedSuccessYet = false;??? https://github.com/phetsims/ratio-and-proportion/issues/63
 * A short but sustained note that plays when the ratio becomes "in proportion"
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import fifthsOption2Sound from '../../../../sounds/in-proportion/in-proportion-fifths-option-2_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

const SUCCESS_OUTPUT_LEVEL = .8;

class InProportionSoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {RatioAndProportionModel} model - TODO: pass all of model in here? At least factor out fitness stuff above
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, model, options ) {
    options = merge( {
      initialOutputLevel: .5
    }, options );
    super( options );

    // @private
    this.model = model;
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;
    this.successSoundClip = new SoundClip( fifthsOption2Sound );
    this.successSoundClip.connect( this.soundSourceDestination );

    // @private - used to determine when no longer in ratio, so that the success sound can be silenced
    this.oldFitness = this.fitnessProperty.value;

    // @private - keep track of if the success sound has already played. This will be set back to false when the fitness
    // goes back out of range for the success sound.
    this.playedSuccessYet = false;
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
    const hysteresisThreshold = this.model.movingInDirection() ? RatioAndProportionQueryParameters.hysteresisThreshold : 0;

    if ( isInRatio && !this.playedSuccessYet ) {

      // TODO: is it possible that this will just bring a previous playing's reverb back to life and the play another instance on top of it? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL, 0 );
      this.successSoundClip.play();
      this.playedSuccessYet = true;
    }
    else if ( this.playedSuccessYet && newFitness < 1 - this.model.getInProportionThreshold() - hysteresisThreshold ) {

      // The fitness has gone away from being in proportion enough that you can now get the sound again
      this.playedSuccessYet = false;
    }

    // if we were in ratio, but now we are not, then fade out the successSoundClip
    if ( this.model.inProportion( this.oldFitness ) && !isInRatio ) {

      // TODO: is there a way to get a notification when this is done ramping down? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( 0, .1 );
    }

    this.oldFitness = newFitness;
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.successSoundClip.stop( 0 );
  }
}

ratioAndProportion.register( 'InProportionSoundGenerator', InProportionSoundGenerator );

export default InProportionSoundGenerator;