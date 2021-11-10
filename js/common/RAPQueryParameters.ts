// Copyright 2020-2021, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import ratioAndProportion from '../ratioAndProportion.js';

const RAPQueryParameters = QueryStringMachine.getAll( {

  // For mechamarker input. Tweak this as needed depending on the input camera, and the range that you will to use in
  // the camera view port.
  heightInPixels: {
    type: 'number',
    defaultValue: 600
  },

  tangible: {
    type: 'flag'
  },

  // Show description qualitative position regions for the hands.
  showRegions: {
    type: 'flag'
  }
} );

ratioAndProportion.register( 'RAPQueryParameters', RAPQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.ratioAndProportion.RAPQueryParameters' );

export default RAPQueryParameters;