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
const RatioAndProportionColorProfile = new ColorProfile( [ 'default' ], {
  gridAndLabelsInFitness: {
    default: Color.GRAY
  },
  gridAndLabelsOutOfFitness: {
    default: Color.DARK_GRAY
  },
  backgroundInFitness: {
    default: new Color( '#639a67' )
  },
  backgroundOutOfFitness: {
    default: new Color( 'white' )
  }
} );

ratioAndProportion.register( 'RatioAndProportionColorProfile', RatioAndProportionColorProfile );
export default RatioAndProportionColorProfile;