// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../ratioAndProportion.js';

const RAPQueryParameters = QueryStringMachine.getAll( {

  // For mechamarker input. Tweak this as needed depending on the input camera, and the range that you will to use in
  // the camera view port.
  heightInPixels: {
    type: 'number',
    defaultValue: 600
  },

  // The distance that you must move away from being in Proportion until you can then come back in proportion and get a
  // success sound to play. See InProportionSoundGenerator. In "fitness" units, so the default value is a space of 10%
  // of the fitness range.
  hysteresisThreshold: {
    type: 'number',
    defaultValue: .1
  },

  /**
   * The distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
   * same direction. See RAPRatio.movingInDirection()
   */
  movingInProportionThreshold: {
    type: 'number',
    defaultValue: .3
  },

  /**
   * The number, in ms that the both hands context response will wait until being released to the aria-live system from the
   * UtteranceQueue. See Utterance.alertStableDelay for more details.
   *
   * A longer delay before speaking the context responses gives more consistent behavior on Safari, where often the
   * alerts would be lost.
   */
  bothHandsContextDelay: {
    type: 'number',

    // Longer than normal because the both hands object response alert is longer than normal, see https://github.com/phetsims/ratio-and-proportion/issues/214
    defaultValue: 2000
  },

  /**
   * The number, in ms that the both hands object response will wait until being released to the aria-live system from the
   * UtteranceQueue. See Utterance.alertStableDelay for more details.
   *
   * Give enough time for the user to stop interacting with the "both hands" mode
   * before describing current object, to prevent too many of these  from queuing up in rapid presses.
   */
  bothHandsObjectDelay: {
    type: 'number',
    defaultValue: 500
  }
} );

ratioAndProportion.register( 'RAPQueryParameters', RAPQueryParameters );
export default RAPQueryParameters;