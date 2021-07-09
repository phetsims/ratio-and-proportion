// Copyright 2020-2021, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import CompositeSoundClip from '../../../../../tambo/js/sound-generators/CompositeSoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import choirLoopSound from '../../../../sounds/moving-in-proportion/moving-in-proportion-choir-loop_mp3.js';
import movingInProportionOrganLoopSound from '../../../../sounds/moving-in-proportion/moving-in-proportion-organ-loop_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

class MovingInProportionSoundGenerator extends SoundGenerator {

  /**
   * @param {RAPModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    options = merge( {
      initialOutputLevel: 0.13
    }, options );

    super( options );

    // @private {SoundClip|CompositeSoundClip|null} - null when no sound
    this.movingInProportionSoundClip = null;

    this.movingInProportionSoundClip = new CompositeSoundClip( [ {
      sound: choirLoopSound,
      options: {
        loop: true,
        trimSilence: true
      }
    }, {
      sound: movingInProportionOrganLoopSound,
      options: {
        loop: true,
        initialOutputLevel: 0.6,
        trimSilence: true
      }
    } ] );
    this.movingInProportionSoundClip.connect( this.soundSourceDestination );

    Property.multilink( [
      model.ratio.movingInDirectionProperty,
      model.inProportionProperty,
      model.ratio.tupleProperty,
      model.ratioFitnessProperty
    ], ( movingInDirection, inProportion ) => {
      if ( movingInDirection && // only when moving
           !model.valuesTooSmallForInProportion() && // no moving in proportion success if too small
           inProportion && // must be fit enough to play the moving in proportion success
           !model.ratioEvenButNotAtTarget()  // don't allow this sound if target isn't 1 but both values are 1
      ) {
        this.movingInProportionSoundClip.setOutputLevel( 1, 0.1 );
        !this.movingInProportionSoundClip.isPlaying && this.movingInProportionSoundClip.play();
      }
      else {
        this.movingInProportionSoundClip.setOutputLevel( 0, 0.2 );
      }
    } );
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.movingInProportionSoundClip.stop( 0 );
  }
}

ratioAndProportion.register( 'MovingInProportionSoundGenerator', MovingInProportionSoundGenerator );

export default MovingInProportionSoundGenerator;