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
import movingInProportionOption3 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-3_wav.js';
import movingInProportionOption4 from '../../../../sounds/moving-in-proportion/moving-in-proportion-loop-option-4_wav.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';

// constants
const CHOIR_TRANQUILITY_BLEND = 'how wonderful this world is, ahhh.';

const MOVING_IN_PROPORTION_SOUNDS = [
  choirAhhSound,
  movingInProportionOption3,
  movingInProportionOption4,
  CHOIR_TRANQUILITY_BLEND
];

class MovingInProportionSoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {RatioAndProportionModel} model
   * @param {Object} [options]
   */
  constructor( ratioFitnessProperty, model, options ) {
    options = merge( {
      initialOutputLevel: .05
    }, options );

    super( options );

    // @private {SoundClip|MultiSoundClip|null} - null when no sound
    this.movingInProportionSoundClip = null;

    designingProperties.movingInProportionSoundSelectorProperty.link( selection => {
      if ( selection === -1 ) {
        this.movingInProportionSoundClip = null;
      }
      else {
        assert && assert( MOVING_IN_PROPORTION_SOUNDS[ selection ] );
        this.movingInProportionSoundClip && this.movingInProportionSoundClip.dispose();

        if ( MOVING_IN_PROPORTION_SOUNDS[ selection ] === CHOIR_TRANQUILITY_BLEND ) {
          this.movingInProportionSoundClip = new MultiSoundClip( [
            { sound: choirAhhSound, options: { loop: true } },
            { sound: movingInProportionOption4, options: { loop: true, initialOutputLevel: .6 } }
          ] );
          this.movingInProportionSoundClip.connect( this.soundSourceDestination );
        }
        else {
          this.movingInProportionSoundClip = new SoundClip( MOVING_IN_PROPORTION_SOUNDS[ selection ], {
            loop: true
          } );
          this.movingInProportionSoundClip.connect( this.soundSourceDestination );
        }
      }
    } );

    Property.multilink( [ model.leftVelocityProperty, model.rightVelocityProperty, ratioFitnessProperty ], (
      leftVelocity, rightVelocity, fitness ) => {
      if ( this.movingInProportionSoundClip ) {
        if ( model.movingInDirection() && // only when moving
             !model.valuesTooSmallForSuccess() && // no moving in proportion success if too small
             model.inProportion() ) { // must be fit enough to play the moving in proportion success
          this.movingInProportionSoundClip.setOutputLevel( 1, .1 );
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

// Private class used to blend two sounds together
class MultiSoundClip extends SoundGenerator {

  /**
   * @param {Array.<sound:SoundClip,options:Object>} soundsAndOptionsTuples
   * @param {Object} [options]
   */
  constructor( soundsAndOptionsTuples, options ) {
    super( options );
    this.soundClips = [];
    for ( let i = 0; i < soundsAndOptionsTuples.length; i++ ) {
      const soundAndOptions = soundsAndOptionsTuples[ i ];
      const soundClip = new SoundClip( soundAndOptions.sound, soundAndOptions.options );
      soundClip.connect( this.soundSourceDestination );
      this.soundClips.push( soundClip );
    }
  }

  /**
   * @public
   */
  play() {
    this.soundClips.forEach( soundClip => soundClip.play() );
  }

  /**
   * @public
   */
  stop() {
    this.soundClips.forEach( soundClip => soundClip.stop() );
  }

  /**
   * @public
   */
  connect( destination ) {
    this.soundClips.forEach( soundClip => soundClip.connect( destination ) );
  }

  /**
   * @public
   */
  dispose() {
    this.soundClips.forEach( soundClip => soundClip.dispose() );
  }

  get isPlaying() {
    return _.some( this.soundClips, soundClip => soundClip.isPlaying );
  }

  /**
   * @public
   * @param {number} outputLevel
   * @param {number} timeConstant
   */
  setOutputLevel( outputLevel, timeConstant ) {
    this.soundClips.forEach( soundClip => soundClip.setOutputLevel( outputLevel, timeConstant ) );
  }
}

ratioAndProportion.register( 'MovingInProportionSoundGenerator', MovingInProportionSoundGenerator );

export default MovingInProportionSoundGenerator;