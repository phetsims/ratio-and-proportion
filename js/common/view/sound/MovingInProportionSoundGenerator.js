// Copyright 2020, University of Colorado Boulder

/**
 * A looped sound that plays when both hands are moving in the same direction, and in proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import choirAhhSound from '../../../../sounds/moving-in-proportion/choir-ahhh-loop_wav.js';
import movingInProportionOption1 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-1_wav.js';
import movingInProportionOption2 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-2_wav.js';
import movingInProportionOption3 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-3_wav.js';
import movingInProportionOption4 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-4_wav.js';
import stringsSound from '../../../../sounds/moving-in-proportion/strings-loop-c5_wav.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

// constants
const FITNESS_THRESHOLD = RatioAndProportionQueryParameters.movingInProportionThreshold;

const MOVING_IN_PROPORTION_SOUNDS = [
  stringsSound,
  choirAhhSound,
  movingInProportionOption1,
  movingInProportionOption2,
  movingInProportionOption3,
  movingInProportionOption4
];

class MovingInProportionSoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {RatioAndProportionModel} model
   * @param {Object} [options]
   */
  constructor( ratioFitnessProperty, model, options ) {
    options = merge( {
      initialOutputLevel: .8
    }, options );

    super();

    // @private
    this.movingInProportionSoundClip = null;

    designingProperties.movingInProportionSoundSelectorProperty.link( selection => {
      if ( selection === -1 ) {
        this.movingInProportionSoundClip = null;
      }
      else {
        assert && assert( MOVING_IN_PROPORTION_SOUNDS[ selection ] );
        this.movingInProportionSoundClip && this.movingInProportionSoundClip.dispose();
        this.movingInProportionSoundClip = new SoundClip( MOVING_IN_PROPORTION_SOUNDS[ selection ], {
          loop: true,
          initialOutputLevel: .7
        } );
        this.movingInProportionSoundClip.connect( this.soundSourceDestination );
      }
    } );

    Property.multilink( [ model.leftVelocityProperty, model.rightVelocityProperty, ratioFitnessProperty ], (
      leftVelocity, rightVelocity, fitness ) => {
      if ( this.movingInProportionSoundClip ) {
        if ( model.movingInDirection() &&
             !model.valuesTooSmallForSuccess() && // no moving in proportion success if too small
             fitness > FITNESS_THRESHOLD ) { // must be fit enough to play the moving in proportion success
          this.movingInProportionSoundClip.setOutputLevel( .7, .1 );
          !this.movingInProportionSoundClip.isPlaying && this.movingInProportionSoundClip.play();
        }
        else {
          this.movingInProportionSoundClip.setOutputLevel( 0, .2 );
        }
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