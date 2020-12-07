// Copyright 2020, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Ratio and Proportion simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ColorProfile from '../../../../scenery-phet/js/ColorProfile.js';
import Color from '../../../../scenery/js/util/Color.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// Even though there is only one Profile, it is still nice to use this pattern for color organizing.
const RAPColorProfile = new ColorProfile( [ 'default' ], {
  tickMarksAndLabelsInFitness: {
    default: Color.DARK_GRAY
  },
  tickMarksAndLabelsOutOfFitness: {
    default: Color.GRAY
  },
  backgroundInFitness: { // the color will jump from backgroundInterpolationToFitness to this when actually in ratio
    default: new Color( '#5ab46c' )
  },
  backgroundInterpolationToFitness: { // this will be the max of the interpolation for the background color
    default: new Color( '#77ce81' )
  },
  backgroundOutOfFitness: {
    default: new Color( 'white' )
  },
  cueArrows: { // cue arrows around the ratio hands.
    default: Color.DARK_GRAY
  },
  createScreenHand: {
    default: new Color( '#8d5cbd' )
  }
} );

ratioAndProportion.register( 'RAPColorProfile', RAPColorProfile );
export default RAPColorProfile;