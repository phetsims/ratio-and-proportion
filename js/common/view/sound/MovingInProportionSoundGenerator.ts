// Copyright 2020-2022, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import CompositeSoundClip from '../../../../../tambo/js/sound-generators/CompositeSoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import movingInProportionChoirLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionChoirLoop_mp3.js';
import movingInProportionOrganLoop_mp3 from '../../../../sounds/moving-in-proportion/movingInProportionOrganLoop_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import RAPModel from '../../model/RAPModel.js';
import RAPRatioTuple from '../../model/RAPRatioTuple.js';

class MovingInProportionSoundGenerator extends SoundGenerator {

  private movingInProportionSoundClip: CompositeSoundClip;

  /**
   * @param {RAPModel} model
   * @param {Object} [options]
   */
  constructor( model: RAPModel, options?: any ) {

    // TODO: convert to optionize once SoundGenerator is typescript https://github.com/phetsims/ratio-and-proportion/issues/404
    options = merge( {
      initialOutputLevel: 0.13
    }, options );

    super( options );

    // @private {CompositeSoundClip}
    this.movingInProportionSoundClip = new CompositeSoundClip( [ {
      sound: movingInProportionChoirLoop_mp3,
      options: {
        loop: true,
        trimSilence: true
      }
    }, {
      sound: movingInProportionOrganLoop_mp3,
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
    ], ( movingInDirection: boolean, inProportion: boolean, tuple: RAPRatioTuple, ratioFitness: number ) => {
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
  reset(): void {
    this.movingInProportionSoundClip.stop();
  }
}

ratioAndProportion.register( 'MovingInProportionSoundGenerator', MovingInProportionSoundGenerator );

export default MovingInProportionSoundGenerator;