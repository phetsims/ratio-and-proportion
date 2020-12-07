// Copyright 2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CreateScreen from './create/CreateScreen.js';
import DiscoverScreen from './discover/DiscoverScreen.js';
import ratioAndProportionStrings from './ratioAndProportionStrings.js';

const ratioAndProportionTitleString = ratioAndProportionStrings[ 'ratio-and-proportion' ].title;

const simOptions = {
  credits: {
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: 'Ashton Morris',
    thanks: ''
  },
  hasKeyboardHelpContent: true
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( ratioAndProportionTitleString, [
    new DiscoverScreen( Tandem.ROOT.createTandem( 'discoverScreen' ) ),
    new CreateScreen( Tandem.ROOT.createTandem( 'createScreen' ) )
  ], simOptions );
  sim.start();
} );