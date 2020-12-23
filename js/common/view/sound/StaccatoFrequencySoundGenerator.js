// Copyright 2020, University of Colorado Boulder

// REVIEW: The specifics of the description seems like it's out of date (they are no longer marimba bonks anymore (I think)).
/**
 * "Marimba bonks" that change frequency based on the fitness of the Proportion
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import c001Sound from '../../../../sounds/staccato/staccato-c-001_mp3.js';
import c002Sound from '../../../../sounds/staccato/staccato-c-002_mp3.js';
import cSharp001Sound from '../../../../sounds/staccato/staccato-c-sharp-001_mp3.js';
import cSharp002Sound from '../../../../sounds/staccato/staccato-c-sharp-002_mp3.js';
import cSharpSound from '../../../../sounds/staccato/staccato-c-sharp_mp3.js';
import cSound from '../../../../sounds/staccato/staccato-c_mp3.js';
import d001Sound from '../../../../sounds/staccato/staccato-d-001_mp3.js';
import d002Sound from '../../../../sounds/staccato/staccato-d-002_mp3.js';
import dSharp001Sound from '../../../../sounds/staccato/staccato-d-sharp-001_mp3.js';
import dSharp002Sound from '../../../../sounds/staccato/staccato-d-sharp-002_mp3.js';
import dSharpSound from '../../../../sounds/staccato/staccato-d-sharp_mp3.js';
import dSound from '../../../../sounds/staccato/staccato-d_mp3.js';
import e001Sound from '../../../../sounds/staccato/staccato-e-001_mp3.js';
import e002Sound from '../../../../sounds/staccato/staccato-e-002_mp3.js';
import eSound from '../../../../sounds/staccato/staccato-e_mp3.js';
import f001Sound from '../../../../sounds/staccato/staccato-f-001_mp3.js';
import f002Sound from '../../../../sounds/staccato/staccato-f-002_mp3.js';
import fSharp001Sound from '../../../../sounds/staccato/staccato-f-sharp-001_mp3.js';
import fSharp002Sound from '../../../../sounds/staccato/staccato-f-sharp-002_mp3.js';
import fSharpSound from '../../../../sounds/staccato/staccato-f-sharp_mp3.js';
import fSound from '../../../../sounds/staccato/staccato-f_mp3.js';
import g001Sound from '../../../../sounds/staccato/staccato-g-001_mp3.js';
import g002Sound from '../../../../sounds/staccato/staccato-g-002_mp3.js';
import gSound from '../../../../sounds/staccato/staccato-g_mp3.js';
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
      initialOutputLevel: 0.25
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
      sounds[ Math.floor( phet.joist.random.nextDouble() * sounds.length ) ].play();
      this.timeSinceLastPlay = 0;
    }
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