// Copyright 2020-2021, University of Colorado Boulder

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

  tangible: {
    type: 'flag'
  }
} );

ratioAndProportion.register( 'RAPQueryParameters', RAPQueryParameters );
export default RAPQueryParameters;