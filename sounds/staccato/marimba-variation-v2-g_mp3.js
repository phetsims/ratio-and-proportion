/* eslint-disable */
import simLauncher from '../../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAA/gBNTQRADGBl/A3MLAC8AAECcwUES4Pl3xOoH3hiUOcH9xQ50F3/t/8oGP/8H5S4XDYNHY7J9v//wAAM5WpeIU9jFuH1Fk9J5/blhsj80F4PBkAGSVbJ4eyeMqPjBN2uhShmR5hc7JxM/7TFdTXVXV3oGhy2IEo771TCao5X7Gefh7+8uSPJOX1DRhFu0eqECSC3IAm//syxAMACExTXv2HgBEHE6x1h7VmxTRqNErg47TXRjqHYfnGspUlsivFbOTBCuVUayKJerbTwUDb+Ek31rQkOyND4LSz4dfPQbco7/01Hup1SoYDAUbVsAADDzzopgJvFZ2bs5+HyKWc1AjwTW/hcmprdGMQpRvzhYDLVZw7Hs6E1LH38yfjGITZk/SNltW3UXsTVQwwASY5NQAAmv/7MsQEgAhIc1Os4aXxGgqoKb085ljClwMnG+haYKa8oxkHqu/cRfM4pvDbwAass38RQhW5EJHMqrGbUQmJ9GTgOxHbJFutuFuGU8s+mogAA3GAAwDKguENPUAFXc70KddzAwaVeZzBzBbVYRIxcw+WcyOgCJfItXSA/zSikuVYN1w3p8FqcbeCWbg8Ww1//////o+pAAAIArQoCAD/+zLEBAAIgEs5resKcP+JZ7WsCWY8vsGdlYIwTHOjIHFXkLAJi0CD+FLF5mygYAeQmyyX9fc5il+H31BgFNQMJCoYA3T3Pqshv0f1vh3//+gEEAEqOCyNgKGciKWwgsgQAmahKtigA9gmHO1SqgCljX1lFShlnvwSjS9lS3SyZuGp/8azH8otdFXXXiP/tssWIQT+C2RuBQXCMsOI//swxAYARuQ3PUzgxXDQBqe1nBSuMyvpbq7mnErgM2NVcBkA1Kf5hOHAsxfAgHRbt9quL5GlXfaQ/9//X9VaCAQYEUc1tj9dljhiioeaNAadFiExWGeaa3JHsHKr4TqZREqe0Az3Lh9N2P+7rr/961////bVADRbY1tsAEC6rp6l+YAf2LCNgcK3EjDJFJdb8Jm0J309WzV9Vtv///syxBOABVArO6Dh4TB1gya0AJgG///+gAkJG8W0OAMTAKkn9B0ZK8kIjXZ9nX/b+R/////cjAAIwL62f///+sVFpoKs/+sV4qKCQ0DIqEhJUL1MQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQzg8OUALzAhEugAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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