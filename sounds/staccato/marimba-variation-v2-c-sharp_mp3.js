/* eslint-disable */
import simLauncher from '../../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAAA9gBLbQBgDGFkmnLN5AAIJAKcZKCDgCxO8MCQMCcP4Ph/L8Mfrt/2f//1HP+XQhFAAAR7LNgQtFmoyopOkQFYwcAGECBkJyYydmmBj5S8KiquxEISRgkfHvCYAnUSxn4fp4KVsiZQSr+Q27H/PTvLT3yZ8opn//utUqX5BZzqVrOeH/h9juP4/XG28LaQtQqBIIkEtSA//syxAMASEynZ12VADD8kWrdvJx3B+8IaMGtqrkr5Hkk6noQRQd8SZfFYivwFJKh84JwzaPXybNahVsl01b5xNzn//Of1HrxLQ/PXF3FlD5JYRiXKrqMsCNYhh46KEMYBEbi9IJbIiZc2UuVXqIvDwtr45gcCWKnlRhoqLUEZ6anY6JLUZDwetOR/UiviCu9agAASKlAgAJhRRpQnP/7MsQGAgjEdUlOaScxCAtoqc2ofuzuUHRPoAF8FSxWmVmoql84gsCJZXlmhkwnzf49OcsPTVBcxsRL+WzxFOdKXshz01v+eKR4NSP///YDUg1AEAGArcAaDTsjLASu/AkAnnCaxE7gQ0Cxs7qTwVBZVeFQRPPnvtf5EmhYicPAiLsIJaCKehf9CPzGz/////XVAEiAABAAgxgSAub/+zLEBYIImEMw73FjsQ2GpImvdAQAgTBnApmGADACReYSqBxJNhQFGCAAa7ZBjYBOOtYz2NFJwhH4iG0hzaytpA16V7h+k7v///////+lAMgOSeMK2MCwRMzFpLTVYiwgJjEOWDoEbQwTwYIpgY/Zj4DJdYKB6ZKAMJADFyALQ4UnVjTtX+dnpK7///9f0f//9ioAAKmm0iYB7gKK//swxAUAB9gtL0x3ILDXBOZ1vLxeYNhgY5V0BlqKAtMIRWNLQwDF0fz+dIu4FeAwB5RXQ4ix1L8pk53X0V7l3dlt2z9X/T1/7KQAEAlLJIEiArlzxoAONiQfws4qknyowsvsFXE+pUkIElqh+xodXLdkCHx9G21wBar//v7f/uoABJJjQQMAANDCaZ2JqUwAh1ThXrOsDUYHCUJK//syxA4ABLQhNaTkwTCZg2Z0F4wWu7Wi1Xpo/63YsAESqPsKBGoJxCVHFlEjhSAxMJMPZLI1/1nS3//1PyqJ3nXu/+6WtsAAAAAAjYAMCigMAFmf/////+sVFm9sWFhUjrZFRUWb9QtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQsA8RkDNujGEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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