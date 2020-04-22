// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../ratioAndProportion.js';

const RatioAndProportionQueryParameters = QueryStringMachine.getAll( {

  // For mechamarker input. Tweak this as needed depending on the input camera, and the range that you will to use in
  // the camera view port.
  heightInPixels: {
    type: 'number',
    defaultValue: 600
  },

  // query parameters for a specific prototype case
  useClementPrototype1: { type: 'flag' },
  clement1AdjLen: { type: 'number', defaultValue: 88 },
  clement1HalfHeight: { type: 'number', defaultValue: 100 }
} );

ratioAndProportion.register( 'RatioAndProportionQueryParameters', RatioAndProportionQueryParameters );
export default RatioAndProportionQueryParameters;