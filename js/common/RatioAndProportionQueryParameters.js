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

  // The distance that you must move away from being in Proportion until you can then come back in proportion and get a
  // success sound to play. See InProportionSoundGenerator. In "fitness" units, so the default value is a space of 10%
  // of the fitness range.
  hysteresisThreshold: {
    type: 'number',
    defaultValue: .1
  },

  /**
   * The fitness must be at least this big to allow the "moving in proportion" sound (choir "ahhh").
   */
  movingInProportionThreshold: {
    type: 'number',
    defaultValue: .8
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

  // query parameters for a specific prototype case
  useClementPrototype1: { type: 'flag' },
  clement1AdjLen: { type: 'number', defaultValue: 88 },
  clement1HalfHeight: { type: 'number', defaultValue: 100 }
} );

ratioAndProportion.register( 'RatioAndProportionQueryParameters', RatioAndProportionQueryParameters );
export default RatioAndProportionQueryParameters;