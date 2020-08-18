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
   * The distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
   * same direction. See RatioAndProportionModel.movingInDirection()
   */
  movingInProportionThreshold: {
    type: 'number',
    defaultValue: .3
  }
} );

ratioAndProportion.register( 'RatioAndProportionQueryParameters', RatioAndProportionQueryParameters );
export default RatioAndProportionQueryParameters;