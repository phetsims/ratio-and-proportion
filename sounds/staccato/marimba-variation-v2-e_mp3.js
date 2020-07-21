/* eslint-disable */
import simLauncher from '../../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABVAxKFSUgDFSlu63HpACBSIBWjnSiBAgQI9UQOXC5OkAMNvUQIAiDhwu/U78Mf4Y5c///5dJAufB9kMAkIAoxLSSTWC0AAAhDIWEnbgMTSkYHakPJ5RDF5hN8Trm2CQObCAYEUSNTHKMc3KLyROOJMTijLK7GZdXffnPf6f251mVPb/nu/5jv3qM/76d9ioBEGyW3JAB//syxAOASGxhbVz1gDEHD6uprCy+RQnwS4FOy0P4IexKJPFFNWCQFRE1YiAIjpNTUEQdRrQ/gZqEjVv1/Py09Je65R6AuVOgru4h4VeiIpbEqEQDqWwxgRxaROYDunPdxgRolHZ6HV1rh7okTrOdiSrp7moHpLlpJVvYkXL3qECzSJUwo9FazUmxomtfa0Hg7O/01QAADTsFEAOUfv/7MsQEgEg8UUtNPS7xEQrotby9HgVfQ4vC1hMWNJuHXrrypnrAkVhtToo3W6zmqYYi0uMnip36lAkW+mSBFNvNAVslDWd1u/6vr///0AAggAx3ah1erE+5gRoc8siwYxdQ415eQmyxthJwonk1GItR4WfeWARJFKR4A/j+dHcNgVVeYQvr9Oo2u+9rOzz327KEqgAACcAAAAMaySj/+zLEBQAISEcxTu2JIQ+HpumuZFYUCAaYcrYfYnuYkgoWVFA6Ne0LMEwkXOSBBjvUZODOi/Rgk+Do1zhIBLAEWTh7HNYqmbipVuNFq4AICxLIwoD6F0wRQEZuyfNaBhECoqI/mji4YAAMqUiGREUkn8RWi0s88sqSShd6sw6j3Ypne6kawXUz2bx/+r//9nv3VQEAg9c8FEzAsRDF//swxAWCCHQ1IE13YPDOBeWlnWBWyXTtQtDJIKQ4PjBQWDfMyTDUJg4GFAky7xNQC25O2YQ/mvA7QkuVHSYIkOWMMjB7v/6v//////yIT4FLhypddcmYOd9QGSJSsBlEFXskRb1Z85bGBoQvc4tlTXCHej///T1V36FZBm/LfT7kqgAwk2PqLI2AXWg9BDqNWhiHFaPAH0gvsupY//syxA0ABUwlP6bh4jC1A6Q09LCGQKIsZjtP/Nfb/d6/1Wf6PYAAAAnGmkQIGJ+egEImYdJwTBybdtHoKvung7Ds7w4HZVx4Nfnuo97Pkv//8JUCNiQAAAAOAUuFq2LZ//////1f1CwqRM1sMxYVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQlA8OAAtGgBEAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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