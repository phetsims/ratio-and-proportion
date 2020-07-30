// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import RatioAndProportionModel from '../common/model/RatioAndProportionModel.js';
import RandomIcon from '../common/view/RandomIcon.js';
import ratioAndProportion from '../ratioAndProportion.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';
import CreateScreenView from './view/CreateScreenView.js';

class CreateScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new ScreenIcon( new RandomIcon( 432432440, '' ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      name: ratioAndProportionStrings.create,
      descriptionContent: ratioAndProportionStrings.a11y.create.homeScreenDescription
    };

    super(
      () => new RatioAndProportionModel( tandem.createTandem( 'model' ) ),
      model => new CreateScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'CreateScreen', CreateScreen );
export default CreateScreen;