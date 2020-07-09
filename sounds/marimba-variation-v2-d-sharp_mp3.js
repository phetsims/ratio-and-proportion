/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABRwBL1QRADFcl/B3MJJCur+4FN1wAMOWFwccD5Q4cwwUdwQ5Q5+Hy7xA57et/ggCDv+UBDKA/DG0jTSjclkml0w3FAAAC130Mogcd+JbydibWYhAdP82wezJBWTiMJDE24o0jIGC4+NTYvQuOIyluhQYzo9swbU8jzvfJ97czbG56Ptesv///w8PuQrXU+pQggANlJJu//syxAOACDhrbbz3gDERl6vpl53eACYuJ/huC/xgqDRjbJmLRvCLDcg2TEHWCjOTGGHFvhxzqVz1iFf/EtrQpdfE/JStfRnk+d+du+y+RngAADTbdYAU5tZDgBQd/CVBi+5OQIk6t6usCNk2KDKNe3bUr+uYmKrzna7CWJ6AHY8DrHgCnud353Of9ed6ZuldCTxF9SpAAC1bqAAEMv/7MsQEAAhsfVdMaWrxEwxpdY28rpTQDuh73bJDwovVhYw8XKyyVuwJXaTBZShXdxFC3CTEjRlQgrzAtEpsRSEO6o+8GIOadJr7rrk1b89DQAAAAUeoAgAFy2aQxyG7SeiGUwifn1ZuIAMDisMQGQCwOeaCwtIiCt89BacZbSawt7QrPUxwsk6JGLE3pW/+c8W////11QAAAAZGAAD/+zLEA4IICEUzrfDFqRKIZR3OiOwAYOUl8goAmL6ZHLI1NMMTzI7GEgQDQUKzAhCP6ElDwqAMRsg0cIVjTiDwKN0ZyVmi9/lBNaBhszXEQMAwAalHzU1jmaque7AksS2ME3Y4nEIwCCUwNA0gPg4cG0CgQFgHMEUeCoHjwDRMvuChCd2mVSTit0fUTJ/+mtX//9YAAHrJG0gBIDXV//swxAUCB/g1NUxvQrDuBaUpjeQmVjIQ4cCdlmRgKgcmFKqvWI5R0g7Ln9C7YiXQuVrZh6zTPUpLO8o6+S97rb/8TW/6/T+p9V+sE02yQIDcGASoAGLtBwYwzFO4Eox1ZAmiuUwNoAVKNTegXQFxOu7aVL2WZ6/tLon079KUWbv9v/f//TpqBIAIUokjaUAC1gHELk1tQfwDVKyi//syxAqABhwrNaM9gXCoA6U0ESQGLCNJt0HQfXbMYlbvbVd/2ovot03RaZ6/0e931gAAEC2NxgmA1CkuJBZubKQAj4CfuIyTIK5V2zyRFrcGg1O//5763fyvJQBgAAAAAAIBxX/////////xUWVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsQhA8JQAOmgAEAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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