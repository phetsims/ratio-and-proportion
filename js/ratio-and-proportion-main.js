// Copyright 2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import designingProperties from './common/designingProperties.js';
import ProportionOptionsDialogContent from './common/view/ProportionOptionsDialogContent.js';
import ChallengeMakerScreen from './challenge-maker/ChallengeMakerScreen.js';
import ExploreScreen from './explore/ExploreScreen.js';
import ratioAndProportionStrings from './ratioAndProportionStrings.js';

const ratioAndProportionTitleString = ratioAndProportionStrings[ 'ratio-and-proportion' ].title;

const simOptions = {
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  },
  createOptionsDialogContent: () => new ProportionOptionsDialogContent( designingProperties )
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( ratioAndProportionTitleString, [
    new ExploreScreen( Tandem.ROOT.createTandem( 'exploreScreen' ) ),
    new ChallengeMakerScreen( Tandem.ROOT.createTandem( 'exploreScreen' ) )
  ], simOptions );
  sim.start();
} );