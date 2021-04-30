// Copyright 2020, University of Colorado Boulder

/**
 * A collection of the sounds associated with sim-specific view components making sounds. In general these have nothing
 * to do with model values, or the state of the model, but instead supply supplemental sound based on interaction input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import merge from '../../../../../phet-core/js/merge.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import grabSound from '../../../../../tambo/sounds/grab_mp3.js';
import releaseSound from '../../../../../tambo/sounds/release_mp3.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import rapConstants from '../../rapConstants.js';
import TickMarkView from '../TickMarkView.js';
import BoundarySoundClip from './BoundarySoundClip.js';
import TickMarkBumpSoundClip from './TickMarkBumpSoundClip.js';

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class ViewSounds {

  /**
   * @param {NumberProperty} tickMarkRangeProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {BooleanProperty} playTickMarkBumpSoundProperty
   * @param {Object} [options]
   */
  constructor( tickMarkRangeProperty, tickMarkViewProperty, playTickMarkBumpSoundProperty, options ) {

    options = merge( {
      addSoundOptions: {
        categoryName: 'user-interface'
      },
      soundClipOptions: {
        initialOutputLevel: 0.15
      }
    }, options );

    // @public - available to control, but don't overwrite after construction
    this.grabSoundClip = new SoundClip( grabSound, options.soundClipOptions );
    this.releaseSoundClip = new SoundClip( releaseSound, options.soundClipOptions );
    this.boundarySoundClip = new BoundarySoundClip( TOTAL_RANGE, merge( {}, options.soundClipOptions, {
      initialOutputLevel: 0.3 // increased from feedback in https://github.com/phetsims/ratio-and-proportion/issues/246
    } ) );
    this.tickMarkBumpSoundClip = new TickMarkBumpSoundClip( tickMarkRangeProperty, TOTAL_RANGE, merge( {}, options.soundClipOptions, {
      initialOutputLevel: 0.3, // increased from feedback in https://github.com/phetsims/ratio-and-proportion/issues/246
      enableControlProperties: [
        playTickMarkBumpSoundProperty,
        new DerivedProperty( [ tickMarkViewProperty ], tickMarkView => tickMarkView !== TickMarkView.NONE )
      ]
    } ) );

    soundManager.addSoundGenerator( this.grabSoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.releaseSoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.boundarySoundClip, options.addSoundOptions );
    soundManager.addSoundGenerator( this.tickMarkBumpSoundClip, merge( {
      sonificationLevel: SoundLevelEnum.ENHANCED
    }, options.addSoundOptions ) );
  }

  /**
   * @public
   */
  reset() {
    this.boundarySoundClip.reset();
    this.tickMarkBumpSoundClip.reset();
  }
}

ratioAndProportion.register( 'ViewSounds', ViewSounds );

export default ViewSounds;