// Copyright 2020-2022, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import ratioAndProportion from '../ratioAndProportion.js';

const RAPQueryParameters = QueryStringMachine.getAll( {

  // Show description qualitative position regions for the hands.
  showPositionRegions: {
    type: 'flag'
  },

  bluetooth: {
    type: 'flag'
  },

  // The model value for the tolerance of the proportion value to the target to be calculated as "in proportion".
  // This should be removed before publication; it is only needed for research in summer, 2022. See https://github.com/phetsims/ratio-and-proportion/issues/465
  mpInProportionThreshold: {
    type: 'number',
    defaultValue: 0.3
  },

  // For bluetooth connections, what should the amount of history be to average/smooth out the jitter. MUST BE 4 OR
  // MORE (to calculate a box plot)!!!
  bluetoothHistoryLength: {
    type: 'number',
    defaultValue: 10
  },

  // The difference between the first and third quartile values of bluetooth history, in ratio units (min 0, max 1)
  bluetoothStationaryThreshold: {
    type: 'number',
    defaultValue: 0.02
  }
} );

ratioAndProportion.register( 'RAPQueryParameters', RAPQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.ratioAndProportion.RAPQueryParameters' );

export default RAPQueryParameters;