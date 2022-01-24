// Copyright 2020-2021, University of Colorado Boulder

/**
 * "Marimba bonk" sounds that change frequency based on the fitness of the Proportion. There are three different types
 * of sounds that randomly cycle through to give variety to sounds played that are the same note.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Range from '../../../../../dot/js/Range.js';
import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import staccatoC_mp3 from '../../../../sounds/staccato/staccatoC_mp3.js';
import staccatoC001_mp3 from '../../../../sounds/staccato/staccatoC001_mp3.js';
import staccatoC002_mp3 from '../../../../sounds/staccato/staccatoC002_mp3.js';
import staccatoCSharp001_mp3 from '../../../../sounds/staccato/staccatoCSharp001_mp3.js';
import staccatoCSharp002_mp3 from '../../../../sounds/staccato/staccatoCSharp002_mp3.js';
import staccatoCSharp_mp3 from '../../../../sounds/staccato/staccatoCSharp_mp3.js';
import staccatoD_mp3 from '../../../../sounds/staccato/staccatoD_mp3.js';
import staccatoD001_mp3 from '../../../../sounds/staccato/staccatoD001_mp3.js';
import staccatoD002_mp3 from '../../../../sounds/staccato/staccatoD002_mp3.js';
import staccatoDSharp001_mp3 from '../../../../sounds/staccato/staccatoDSharp001_mp3.js';
import staccatoDSharp002_mp3 from '../../../../sounds/staccato/staccatoDSharp002_mp3.js';
import staccatoDSharp_mp3 from '../../../../sounds/staccato/staccatoDSharp_mp3.js';
import staccatoE_mp3 from '../../../../sounds/staccato/staccatoE_mp3.js';
import staccatoE001_mp3 from '../../../../sounds/staccato/staccatoE001_mp3.js';
import staccatoE002_mp3 from '../../../../sounds/staccato/staccatoE002_mp3.js';
import staccatoF_mp3 from '../../../../sounds/staccato/staccatoF_mp3.js';
import staccatoF001_mp3 from '../../../../sounds/staccato/staccatoF001_mp3.js';
import staccatoF002_mp3 from '../../../../sounds/staccato/staccatoF002_mp3.js';
import staccatoFSharp001_mp3 from '../../../../sounds/staccato/staccatoFSharp001_mp3.js';
import staccatoFSharp002_mp3 from '../../../../sounds/staccato/staccatoFSharp002_mp3.js';
import staccatoFSharp_mp3 from '../../../../sounds/staccato/staccatoFSharp_mp3.js';
import staccatoG_mp3 from '../../../../sounds/staccato/staccatoG_mp3.js';
import staccatoG001_mp3 from '../../../../sounds/staccato/staccatoG001_mp3.js';
import staccatoG002_mp3 from '../../../../sounds/staccato/staccatoG002_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import IReadOnlyProperty from '../../../../../axon/js/IReadOnlyProperty.js';

// organize the sounds by variation and note
const staccatoSounds = [
  [ staccatoC_mp3, staccatoC001_mp3, staccatoC002_mp3 ],
  [ staccatoCSharp001_mp3, staccatoCSharp002_mp3, staccatoCSharp_mp3 ],
  [ staccatoD_mp3, staccatoD001_mp3, staccatoD002_mp3 ],
  [ staccatoDSharp001_mp3, staccatoDSharp002_mp3, staccatoDSharp_mp3 ],
  [ staccatoE_mp3, staccatoE001_mp3, staccatoE002_mp3 ],
  [ staccatoF_mp3, staccatoF001_mp3, staccatoF002_mp3 ],
  [ staccatoFSharp001_mp3, staccatoFSharp002_mp3, staccatoFSharp_mp3 ],
  [ staccatoG_mp3, staccatoG001_mp3, staccatoG002_mp3 ]
];

class StaccatoFrequencySoundGenerator extends SoundGenerator {


  private inProportionProperty: IReadOnlyProperty<boolean>;
  private fitnessProperty: IReadOnlyProperty<number>;
  private staccatoSoundClips: SoundClip[][];
  private timeLinearFunction: LinearFunction;
  private timeSinceLastPlay: number;

  /**
   * @param {Property.<number>} fitnessProperty
   * @param {Range} fitnessRange
   * @param {Property.<boolean>} inProportionProperty - true when the model ratio is in proportion
   * @param {Object} [options]
   */
  constructor( fitnessProperty: IReadOnlyProperty<number>, fitnessRange: Range, inProportionProperty: IReadOnlyProperty<boolean>, options: object ) {

    // TODO: convert to optionize once SoundGenerator is typescript https://github.com/phetsims/ratio-and-proportion/issues/404
    options = merge( {
      initialOutputLevel: 0.25
    }, options );

    super( options );

    // @private
    this.inProportionProperty = inProportionProperty;
    this.fitnessProperty = fitnessProperty;

    // @private {SoundClip[][]}
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
  step( dt: number ): void {
    const newFitness = this.fitnessProperty.value;

    // If fitness is less than zero, make sure enough time has past that it will play a sound immediately.
    this.timeSinceLastPlay = newFitness > 0 ? this.timeSinceLastPlay + dt * 1000 : 1000000;

    const isInRatio = this.inProportionProperty.value;
    if ( this.timeSinceLastPlay > this.timeLinearFunction.evaluate( newFitness ) && !isInRatio && newFitness > 0 ) {
      const sounds = this.staccatoSoundClips[ Math.floor( newFitness * this.staccatoSoundClips.length ) ];
      sounds[ Math.floor( dotRandom.nextDouble() * sounds.length ) ].play();
      this.timeSinceLastPlay = 0;
    }
  }

  /**
   * stop any in-progress sound generation
   * @public
   */
  reset(): void {
    this.timeSinceLastPlay = 0;
  }
}

ratioAndProportion.register( 'StaccatoFrequencySoundGenerator', StaccatoFrequencySoundGenerator );

export default StaccatoFrequencySoundGenerator;