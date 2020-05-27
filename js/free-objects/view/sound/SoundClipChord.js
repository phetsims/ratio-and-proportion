// Copyright 2020, University of Colorado Boulder

/**
 * Given a sound, make a chord based on it, and provided playback rates that correspond to notes.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundGenerator from '../../../../../tambo/js/sound-generators/SoundGenerator.js';
import ratioAndProportion from '../../../ratioAndProportion.js';

class SoundClipChord extends SoundGenerator {

  /**
   * @param {WrappedAudioBuffer} sound
   * @param {Object} [options]
   */
  constructor( sound, options ) {
    options = merge( {
      initialOutputLevel: .7,
      chordPlaybackRates: [ 1, Math.pow( 2, 4 / 12 ), Math.pow( 2, 7 / 12 ) ] // default to major chord
    }, options );

    super( options );

    // @private
    this.playbackSoundClips = options.chordPlaybackRates.map( playbackRate => {
      const soundClip = new SoundClip( sound, { initialPlaybackRate: playbackRate } );
      soundClip.connect( this.masterGainNode );
      return soundClip;
    } );
  }

  /**
   * @public
   */
  play() {
    this.playbackSoundClips.forEach( soundClip => soundClip.play() );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.playbackSoundClips.forEach( soundClip => soundClip.dispose() );
    this.playbackSoundClips.length = 0;
    super.dispose();
  }
}

ratioAndProportion.register( 'SoundClipChord', SoundClipChord );
export default SoundClipChord;