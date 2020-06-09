/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = simLauncher.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();
const onDecodeSuccess = decodedAudio => {
  wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
  unlock();
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 0, phetAudioContext.sampleRate ) );
  unlock();
};
phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
export default wrappedAudioBuffer;