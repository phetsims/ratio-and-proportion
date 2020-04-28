// Copyright 2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import CursorDisplay from './free-objects/model/CursorDisplay.js';
import ProportionOptionsDialogContent from './free-objects/view/ProportionOptionsDialogContent.js';
import FreeObjectsScreen from './free-objects/FreeObjectsScreen.js';
import ratioAndProportionStrings from './ratioAndProportionStrings.js';

const ratioAndProportionTitleString = ratioAndProportionStrings[ 'ratio-and-proportion' ].title;

// global object for selecting proportion "fitness" sounds, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/9
window.phet.ratioAndProportion.proportionFitnessSoundSelectorProperty = new NumberProperty( 0 );

// @public {Property.<CursorDisplay>} - this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/17
window.phet.ratioAndProportion.markerDisplayProperty = new EnumerationProperty( CursorDisplay, CursorDisplay.HAND );

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
  createOptionsDialogContent: () => new ProportionOptionsDialogContent( window.phet.ratioAndProportion.proportionFitnessSoundSelectorProperty )
};

// launch the sim - beware that scenery Image nodes created outside of SimLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
SimLauncher.launch( () => {
  const sim = new Sim( ratioAndProportionTitleString, [
    new FreeObjectsScreen( Tandem.ROOT.createTandem( 'freeObjectsScreen' ) )
  ], simOptions );
  sim.start();
} );