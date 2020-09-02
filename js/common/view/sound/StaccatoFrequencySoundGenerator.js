// Copyright 2020, University of Colorado Boulder

/**
 * Marimba bonks that change frequency based on the fitness of the Proportion
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import c001Sound from '../../../../sounds/staccato/marimba-variation-v2-c-001_mp3.js';
import c002Sound from '../../../../sounds/staccato/marimba-variation-v2-c-002_mp3.js';
import cSharp001Sound from '../../../../sounds/staccato/marimba-variation-v2-c-sharp-001_mp3.js';
import cSharp002Sound from '../../../../sounds/staccato/marimba-variation-v2-c-sharp-002_mp3.js';
import cSharpSound from '../../../../sounds/staccato/marimba-variation-v2-c-sharp_mp3.js';
import cSound from '../../../../sounds/staccato/marimba-variation-v2-c_mp3.js';
import d001Sound from '../../../../sounds/staccato/marimba-variation-v2-d-001_mp3.js';
import d002Sound from '../../../../sounds/staccato/marimba-variation-v2-d-002_mp3.js';
import dSharp001Sound from '../../../../sounds/staccato/marimba-variation-v2-d-sharp-001_mp3.js';
import dSharp002Sound from '../../../../sounds/staccato/marimba-variation-v2-d-sharp-002_mp3.js';
import dSharpSound from '../../../../sounds/staccato/marimba-variation-v2-d-sharp_mp3.js';
import dSound from '../../../../sounds/staccato/marimba-variation-v2-d_mp3.js';
import e001Sound from '../../../../sounds/staccato/marimba-variation-v2-e-001_mp3.js';
import e002Sound from '../../../../sounds/staccato/marimba-variation-v2-e-002_mp3.js';
import eSound from '../../../../sounds/staccato/marimba-variation-v2-e_mp3.js';
import f001Sound from '../../../../sounds/staccato/marimba-variation-v2-f-001_mp3.js';
import f002Sound from '../../../../sounds/staccato/marimba-variation-v2-f-002_mp3.js';
import fSharp001Sound from '../../../../sounds/staccato/marimba-variation-v2-f-sharp-001_mp3.js';
import fSharp002Sound from '../../../../sounds/staccato/marimba-variation-v2-f-sharp-002_mp3.js';
import fSharpSound from '../../../../sounds/staccato/marimba-variation-v2-f-sharp_mp3.js';
import fSound from '../../../../sounds/staccato/marimba-variation-v2-f_mp3.js';
import g001Sound from '../../../../sounds/staccato/marimba-variation-v2-g-001_mp3.js';
import g002Sound from '../../../../sounds/staccato/marimba-variation-v2-g-002_mp3.js';
import gSound from '../../../../sounds/staccato/marimba-variation-v2-g_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

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

class StaccatoFrequencySoundGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {function():boolean} isInProportion - true when the model ratio is in proportion
   * @param {Object} [options]
   */
  constructor( fitnessProperty, fitnessRange, isInProportion, options ) {
    options = merge( {
      initialOutputLevel: 0.3
    }, options );

    super( options );

    // @private
    this.isInProportion = isInProportion;
    this.fitnessProperty = fitnessProperty;

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

    // @private - the minimum amount of gap between two sounds, which increases based on the fitness
    this.timeLinearFunction = new LinearFunction(
      fitnessRange.min,
      fitnessRange.max,
      500,
      120,
      true );

    // @private - in ms, keep track of the amount of time that has passed since the last staccato sound played
    this.timeSinceLastPlay = 0;

    // @private {number} - keep track of the last value to prevent the same sound from being played twice in a row.
    // TODO: do we need this, or would it be ok to repeat these sounds sometimes?
    this.lastStaccatoSoundValue = -1;
  }

  /**
   * Step this sound generator, used for fading out the sound in the absence change.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    const newFitness = this.fitnessProperty.value;

    // If fitness is less than zero, make sure enough time has past that it will play a sound immediately.
    this.timeSinceLastPlay = newFitness > 0 ? this.timeSinceLastPlay + dt * 1000 : 1000000;

    const isInRatio = this.isInProportion();
    if ( this.timeSinceLastPlay > this.timeLinearFunction( newFitness ) && !isInRatio && newFitness > 0 ) {
      const sounds = this.staccatoSoundClips[ Math.floor( newFitness * this.staccatoSoundClips.length ) ];
      sounds[ this.getStaccatoSoundValueToPlay() ].play();
      this.timeSinceLastPlay = 0;
    }
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
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;