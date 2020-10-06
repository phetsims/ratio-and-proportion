// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import RAPKeyboardHelpContent from '../common/view/RAPKeyboardHelpContent.js';
import ratioAndProportion from '../ratioAndProportion.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';
import DiscoverScreenIcon from './view/DiscoverScreenIcon.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';

class DiscoverScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new DiscoverScreenIcon(),
      name: ratioAndProportionStrings.discover,
      descriptionContent: ratioAndProportionStrings.a11y.discover.homeScreenDescription,
      keyboardHelpNode: new RAPKeyboardHelpContent()
    };

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      model => new DiscoverScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'DiscoverScreen', DiscoverScreen );
export default DiscoverScreen;