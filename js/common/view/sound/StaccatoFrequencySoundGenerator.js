// Copyright 2020, University of Colorado Boulder

/**
 * TODO: isInteractingProperty should reset this.playedSuccessYet = false;??? https://github.com/phetsims/ratio-and-proportion/issues/63
 * Marimba bonks that change frequency based on the fitness of the Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import dingRingOutSound from '../../../../sounds/c4-ding-ring-out_mp3.js';
import glockMarimbaCMaj7ArpeggioSound from '../../../../sounds/glock-marimba-c-maj-7-arp_mp3.js';
import c001Sound from '../../../../sounds/marimba-variation-v2-c-001_mp3.js';
import c002Sound from '../../../../sounds/marimba-variation-v2-c-002_mp3.js';
import cSharp001Sound from '../../../../sounds/marimba-variation-v2-c-sharp-001_mp3.js';
import cSharp002Sound from '../../../../sounds/marimba-variation-v2-c-sharp-002_mp3.js';
import cSharpSound from '../../../../sounds/marimba-variation-v2-c-sharp_mp3.js';
import cSound from '../../../../sounds/marimba-variation-v2-c_mp3.js';
import d001Sound from '../../../../sounds/marimba-variation-v2-d-001_mp3.js';
import d002Sound from '../../../../sounds/marimba-variation-v2-d-002_mp3.js';
import dSharp001Sound from '../../../../sounds/marimba-variation-v2-d-sharp-001_mp3.js';
import dSharp002Sound from '../../../../sounds/marimba-variation-v2-d-sharp-002_mp3.js';
import dSharpSound from '../../../../sounds/marimba-variation-v2-d-sharp_mp3.js';
import dSound from '../../../../sounds/marimba-variation-v2-d_mp3.js';
import e001Sound from '../../../../sounds/marimba-variation-v2-e-001_mp3.js';
import e002Sound from '../../../../sounds/marimba-variation-v2-e-002_mp3.js';
import eSound from '../../../../sounds/marimba-variation-v2-e_mp3.js';
import f001Sound from '../../../../sounds/marimba-variation-v2-f-001_mp3.js';
import f002Sound from '../../../../sounds/marimba-variation-v2-f-002_mp3.js';
import fSharp001Sound from '../../../../sounds/marimba-variation-v2-f-sharp-001_mp3.js';
import fSharp002Sound from '../../../../sounds/marimba-variation-v2-f-sharp-002_mp3.js';
import fSharpSound from '../../../../sounds/marimba-variation-v2-f-sharp_mp3.js';
import fSound from '../../../../sounds/marimba-variation-v2-f_mp3.js';
import g001Sound from '../../../../sounds/marimba-variation-v2-g-001_mp3.js';
import g002Sound from '../../../../sounds/marimba-variation-v2-g-002_mp3.js';
import gSound from '../../../../sounds/marimba-variation-v2-g_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import designingProperties from '../../designingProperties.js';
import RatioAndProportionQueryParameters from '../../RatioAndProportionQueryParameters.js';

// organize the sounds by variation and note
const staccatoSounds = [
  [ cSound, c001Sound, c002Sound ],
  [ cSharpSound, cSharp001Sound, cSharp002Sound ],
  [ dSound, d001Sound, d002Sound ],
  [ dSharpSound, dSharp001Sound, dSharp002Sound ],
  [ eSound, e001Sound, e002Sound ],
  [ fSound, f001Sound, f002Sound ],
  [ fSharpSound, fSharp001Sound, fSharp002Sound ],
  [ gSound, g001Sound, g002Sound ]
];

// TODO: success sound should be its own generator, #9
const SUCCESS_OUTPUT_LEVEL = .8;

class StaccatoFrequencySoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {RatioAndProportionModel} model - TODO: pass all of model in here? At least factor out fitness stuff above
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, model, options ) {
    options = merge( {
      initialOutputLevel: 0.4
    }, options );
    super( options );

    const singleSuccessSoundClip = new SoundClip( dingRingOutSound );
    const singleArpeggiatedChord = new SoundClip( glockMarimbaCMaj7ArpeggioSound );
    singleSuccessSoundClip.connect( this.soundSourceDestination );
    singleArpeggiatedChord.connect( this.soundSourceDestination );

    // @private
    this.successSoundClip = null;
    designingProperties.staccatoSuccessSoundSelectorProperty.link( selector => {
      if ( selector === 0 ) {
        this.successSoundClip = singleSuccessSoundClip;
      }
      else if ( selector === 1 ) {
        this.successSoundClip = singleArpeggiatedChord;
      }
      else {
        assert && assert( false, 'unexpected staccato success sound selected' );
      }
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL );
    } );


    // @private {SoundClip[]}
    this.staccatoSoundClips = [];

    // create a SoundClip for each sound
    for ( let i = 0; i < staccatoSounds.length; i++ ) {
      const variationSounds = staccatoSounds[ i ];
      const soundClipsForVariation = [];
      for ( let j = 0; j < variationSounds.length; j++ ) {
        const variationSound = variationSounds[ j ];
        const soundClip = new SoundClip( variationSound );
        soundClip.connect( this.soundSourceDestination );
        soundClipsForVariation.push( soundClip );
      }
      this.staccatoSoundClips.push( soundClipsForVariation );
    }

    // @private
    this.model = model;
    this.fitnessProperty = fitnessProperty;
    this.fitnessRange = fitnessRange;

    // @private - the minimum amount of gap between two sounds, which increases based on the fitness
    this.timeLinearFunction = new LinearFunction(
      fitnessRange.min,
      fitnessRange.max,
      500,
      RatioAndProportionQueryParameters.staccatoMinRepeatTime,
      true );

    // @private - in ms, keep track of the amount of time that has passed since the last staccato sound played
    this.timeSinceLastPlay = 0;

    // @private - TODO we may get rid of this in exchange for a better hysterisis algorithm for in proportion sounds
    this.oldFitness = this.fitnessProperty.value;

    // @private {number} - keep track of the last value to prevent the same sound from being played twice in a row.
    // TODO: do we need this, or would it be ok to repeat these sounds sometimes?
    this.lastStaccatoSoundValue = -1;

    // @private - keep track of if the success sound has already played. This will be set back to false when the fitness
    // goes back out of range for the success sound.
    this.playedSuccessYet = false;

    // @private - only play a new sound if fitness has changed since the last play
    this.fitnessChangedSinceLastPlay = true;
    fitnessProperty.lazyLink( () => { this.fitnessChangedSinceLastPlay = true; } );
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    const newFitness = this.fitnessProperty.value;

    // don't play staccato sounds when fitness is 0
    // TODO: isn't this taken care of by another part of the model?
    if ( newFitness === this.fitnessRange.min ) {
      return;
    }

    // Only increment when within some amount of fitness. This helps prevent sporadic notes from playing when you move
    // the ratio hands quickly and drastically.
    this.timeSinceLastPlay = newFitness > 0 ? this.timeSinceLastPlay + dt * 1000 : 0;

    const isInRatio = this.model.inProportion();
    if ( isInRatio && !this.playedSuccessYet ) {

      // TODO: is it possible that this will just bring a previous playing's reverb back to life and the play another instance on top of it? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( SUCCESS_OUTPUT_LEVEL, 0 );
      this.successSoundClip.play();
      this.playedSuccessYet = true;
    }
    else if ( this.timeSinceLastPlay > this.timeLinearFunction( newFitness ) && !isInRatio ) {

      if ( this.fitnessChangedSinceLastPlay ) {
        const sounds = this.staccatoSoundClips[ Math.floor( newFitness * this.staccatoSoundClips.length ) ];
        sounds[ this.getStaccatoSoundValueToPlay() ].play();
        this.fitnessChangedSinceLastPlay = false;
      }
      this.timeSinceLastPlay = 0;
    }

    // if we were in ratio, but now we are not, then fade out the successSoundClip
    if ( this.model.inProportion( this.oldFitness ) && !isInRatio ) {

      // TODO: is there a way to get a notification when this is done ramping down? https://github.com/phetsims/ratio-and-proportion/issues/63
      this.successSoundClip.setOutputLevel( 0, .1 );
      this.playedSuccessYet = false;
    }

    this.oldFitness = newFitness;
  }

  /**
   * Get the value of the MultiClip map for the staccato sound to play, see "staccatoSoundMap"
   * @returns {number}
   * @private
   */
  getStaccatoSoundValueToPlay() {

    let soundValue = this.lastStaccatoSoundValue;
    while ( soundValue === this.lastStaccatoSoundValue ) {

      // "3 + 1" is a hard coded number based on staccatoSoundMap
      soundValue = Math.floor( phet.joist.random.nextDouble() * 3 );
    }

    this.lastStaccatoSoundValue = soundValue;
    return soundValue;
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset() {
    this.staccatoSoundClip.stop( 0 );
    this.successSoundClip.stop( 0 );
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;