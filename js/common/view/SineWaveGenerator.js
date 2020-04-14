// Copyright 2019-2020, University of Colorado Boulder

/**
 */

import merge from '../../../../phet-core/js/merge.js';
import SoundGenerator from '../../../../tambo/js/sound-generators/SoundGenerator.js';
import soundConstants from '../../../../tambo/js/soundConstants.js';
import proportion from '../../proportion.js';

class SineWaveGenerator extends SoundGenerator {

  /**
   * @param {Property.<number>} frequencyProperty
   * @param {Object} [options]
   */
  constructor( frequencyProperty, options ) {
    options = merge( {
      initialOutputLevel: .2,
      oscillatorType: 'sine'
    }, options );
    super( options );
    this.fullyEnabledProperty.link( value => console.log( 'enabled?', value ) );

    // @private {OscillatorNode|null} created when sound begins and nullified when sound ends, see #373
    this.oscillator = null;
    const updateFrequency = () => {
      const value = frequencyProperty.value;
      console.log( value, this.oscillator );
      this.oscillator && this.oscillator.frequency.setValueAtTime( value, this.audioContext.currentTime );
    };
    frequencyProperty.link( updateFrequency );

    this.fullyEnabledProperty.link( fullyEnabled => {
      if ( fullyEnabled && this.oscillator === null ) {
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = options.oscillatorType;
        updateFrequency();
        this.oscillator.connect( this.masterGainNode );
        this.oscillator.start();
      }
      else if ( !fullyEnabled && this.oscillator !== null ) {

        // The parent fades out, we schedule a stop to coincide with the end of the fade out time.
        this.oscillator.stop( this.audioContext.currentTime + soundConstants.DEFAULT_LINEAR_GAIN_CHANGE_TIME );
        this.oscillator = null;
        // note that there is no need to disconnect the oscillator - this happens automatically
      }
    } );
  }
}

proportion.register( 'SineWaveGenerator', SineWaveGenerator );

export default SineWaveGenerator;