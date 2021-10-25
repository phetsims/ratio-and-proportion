// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';
import DiscoverScreenIcon from './view/DiscoverScreenIcon.js';
import DiscoverScreenKeyboardHelpContent from './view/DiscoverScreenKeyboardHelpContent.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';
import Tandem from '../../../tandem/js/Tandem.js';

class DiscoverScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem: Tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new DiscoverScreenIcon(),
      name: ratioAndProportionStrings.screen.discover,
      descriptionContent: ratioAndProportionStrings.a11y.discover.homeScreenDescription,
      keyboardHelpNode: new DiscoverScreenKeyboardHelpContent()
    };

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      ( model: RAPModel ) => new DiscoverScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'DiscoverScreen', DiscoverScreen );
export default DiscoverScreen;