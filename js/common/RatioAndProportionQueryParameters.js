// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../ratioAndProportion.js';

const RatioAndProportionQueryParameters = QueryStringMachine.getAll( {

  // Adjust the tolerance for the proportion fitness algorithm. The higher the tolerance, the wider the fitness "middle
  // ground" is. The specific unit is a percent of the height of the ratio, in either direction from the ratio. So a
  // tolerance of .2 will map fitness of 0 to .2 above or below the target value for that ratio half. See https://github.com/phetsims/ratio-and-proportion/issues/14
  tolerance: {
    type: 'number',
    defaultValue: .2
  },

  // For mechamarker input. Tweak this as needed depending on the input camera, and the range that you will to use in
  // the camera view port.
  heightInPixels: {
    type: 'number',
    defaultValue: 600
  },

  // For staccato sounds, what is the quickest interval that the sound will play when close or at successful ratio, in ms.
  staccatoMinRepeatTime: {
    type: 'number',
    defaultValue: 120
  },

  // query parameters for a specific prototype case
  useClementPrototype1: { type: 'flag' },
  clement1AdjLen: { type: 'number', defaultValue: 88 },
  clement1HalfHeight: { type: 'number', defaultValue: 100 }
} );

ratioAndProportion.register( 'RatioAndProportionQueryParameters', RatioAndProportionQueryParameters );
export default RatioAndProportionQueryParameters;