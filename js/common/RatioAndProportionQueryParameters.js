// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific query parameters
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../ratioAndProportion.js';

const RatioAndProportionQueryParameters = QueryStringMachine.getAll( {

  // Adjust the tolerance for the proportion fitness algorithm. The higher the tolerance, the wider the fitness "middle
  // ground" is. The specific unit is the percent above or below the left value can be from the target left value. See https://github.com/phetsims/ratio-and-proportion/issues/14
  tolerance: {
    type: 'number',
    defaultValue: .1
  },

  // For mechamarker input. Tweak this as needed depending on the input camera, and the range that you will to use in
  // the camera view port.
  heightInPixels: {
    type: 'number',
    defaultValue: 600
  },

  // For staccato sounds when frequnecy is changing (faster notes at higher fitness): what is the quickest interval
  //    that the sound will play when close or at successful ratio, in ms.
  // For staccoto sounds when frequency is not changing: what is the minimum amount of time that must occur between two
  //    notes playing, even if fitness changes above fitnessChangeThreshold (prevents hearing all notes when mousing
  //    from top to bottom in 1ms).
  staccatoMinRepeatTime: {
    type: 'number',
    defaultValue: 120
  },

  // For staccato sounds when frequency is not changing only: what is the amount that fitness has to change to trigger
  // a sound to be played (fitness is from 0-1). Note that the "number of total notes" in the range is roughly calculated
  // with `2 * (1/fitnessChangeThreshold), because there will be a fitness range on either side of the correct ratio
  // position.
  fitnessChangeThreshold: {
    type: 'number',
    defaultValue: .2
  },

  // query parameters for a specific prototype case
  useClementPrototype1: { type: 'flag' },
  clement1AdjLen: { type: 'number', defaultValue: 88 },
  clement1HalfHeight: { type: 'number', defaultValue: 100 }
} );

ratioAndProportion.register( 'RatioAndProportionQueryParameters', RatioAndProportionQueryParameters );
export default RatioAndProportionQueryParameters;