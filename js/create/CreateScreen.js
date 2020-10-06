// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';
import CreateScreenIcon from './view/CreateScreenIcon.js';
import CreateScreenKeyboardHelpContent from './view/CreateScreenKeyboardHelpContent.js';
import CreateScreenView from './view/CreateScreenView.js';

class CreateScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new CreateScreenIcon(),
      name: ratioAndProportionStrings.create,
      descriptionContent: ratioAndProportionStrings.a11y.create.homeScreenDescription,
      keyboardHelpNode: new CreateScreenKeyboardHelpContent()
    };

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      model => new CreateScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'CreateScreen', CreateScreen );
export default CreateScreen;