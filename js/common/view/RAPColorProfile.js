// Copyright 2020-2021, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the Ratio and Proportion simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Color from '../../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// Even though there is only one Profile, it is still nice to use this pattern for color organizing.
const RAPColorProfile = {
  tickMarksAndLabelsInFitnessProperty: new ProfileColorProperty( 'tickMarksAndLabelsInFitness', {
    default: Color.DARK_GRAY
  } ),
  tickMarksAndLabelsOutOfFitnessProperty: new ProfileColorProperty( 'tickMarksAndLabelsOutOfFitness', {
    default: Color.GRAY
  } ),

  // the color will jump from backgroundInterpolationToFitness to this when actually in ratio
  backgroundInFitnessProperty: new ProfileColorProperty( 'backgroundInFitness', {
    default: new Color( '#5ab46c' )
  } ),

  // this will be the max of the interpolation for the background color
  backgroundInterpolationToFitnessProperty: new ProfileColorProperty( 'backgroundInterpolationToFitness', {
    default: new Color( '#77ce81' )
  } ),
  backgroundOutOfFitnessProperty: new ProfileColorProperty( 'backgroundOutOfFitness', {
    default: new Color( 'white' )
  } ),

  // cue arrows around the ratio hands.
  cueArrowsProperty: new ProfileColorProperty( 'cueArrows', {
    default: Color.DARK_GRAY
  } ),
  createScreenHandProperty: new ProfileColorProperty( 'createScreenHand', {
    default: new Color( '#8d5cbd' )
  } ),
  discoverChallenge1Property: new ProfileColorProperty( 'discoverChallenge1', {
    default: new Color( 233, 69, 69 )
  } ),
  discoverChallenge2Property: new ProfileColorProperty( 'discoverChallenge2', {
    default: new Color( 87, 182, 221 )
  } ),
  discoverChallenge3Property: new ProfileColorProperty( 'discoverChallenge3', {
    default: new Color( 255, 200, 0 )
  } )
};

ratioAndProportion.register( 'RAPColorProfile', RAPColorProfile );
export default RAPColorProfile;