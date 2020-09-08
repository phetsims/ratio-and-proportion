/* eslint-disable */
import simLauncher from '../../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

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