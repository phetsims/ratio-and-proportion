// Copyright 2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann
 */

import NumberProperty from '../../axon/js/NumberProperty.js';
import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BarScreen from './bar/BarScreen.js';
import ProportionOptionsDialogContent from './common/view/ProportionOptionsDialogContent.js';
import FreeObjectsScreen from './free-objects/FreeObjectsScreen.js';
import proportionStrings from './proportionStrings.js';

const proportionTitleString = proportionStrings.proportion.title;

// global object for selecting proportion "fitness" sounds, this is temporary, see https://github.com/phetsims/proportion/issues/9
window.phet.proportion.proportionFitnessSoundSelectorProperty = new NumberProperty( 1 );

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
  createOptionsDialogContent: () => new ProportionOptionsDialogContent( window.phet.proportion.proportionFitnessSoundSelectorProperty )
};

// launch the sim - beware that scenery Image nodes created outside of SimLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
SimLauncher.launch( () => {
  const sim = new Sim( proportionTitleString, [
    new FreeObjectsScreen( Tandem.ROOT.createTandem( 'freeObjectsScreen' ) ),
    new BarScreen( Tandem.ROOT.createTandem( 'barScreen' ) )
  ], simOptions );
  sim.start();
} );