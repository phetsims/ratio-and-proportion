// Copyright 2020, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import MultiSoundClip from '../../../../../tambo/js/sound-generators/MultiSoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import choirAhhSound from '../../../../sounds/moving-in-proportion/choir-ahhh-loop_mp3.js';
import movingInProportionOption4 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-4_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

class MovingInProportionSoundGenerator extends SoundGenerator {

  /**
   * @param {RAPModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    options = merge( {
      initialOutputLevel: .13
    }, options );

    super( options );

    // @private {SoundClip|MultiSoundClip|null} - null when no sound
    this.movingInProportionSoundClip = null;

    this.movingInProportionSoundClip = new MultiSoundClip( [
      {
        sound: choirAhhSound,
        options: {
          loop: true,
          trimSilence: true
        }
      }, {
        sound: movingInProportionOption4,
        options: {
          loop: true,
          initialOutputLevel: .6,
          trimSilence: true
        }
      }
    ] );
    this.movingInProportionSoundClip.connect( this.soundSourceDestination );

    Property.multilink( [
      model.ratio.changeInNumeratorProperty,
      model.ratio.changeInDenominatorProperty,
      model.ratioFitnessProperty
    ], () => {
      if ( model.ratio.movingInDirection() && // only when moving
           !model.valuesTooSmallForSuccess() && // no moving in proportion success if too small
           model.inProportion() ) { // must be fit enough to play the moving in proportion success
        this.movingInProportionSoundClip.setOutputLevel( 1, .1 );
        !this.movingInProportionSoundClip.isPlaying && this.movingInProportionSoundClip.play();
      }
      else {
        this.movingInProportionSoundClip.setOutputLevel( 0, .2 );
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