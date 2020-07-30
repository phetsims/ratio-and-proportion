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
import ExploreScreenView from './view/ExploreScreenView.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';

class ExploreScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new ScreenIcon( new RandomIcon( 432140, '' ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      name: ratioAndProportionStrings.explore,
      descriptionContent: ratioAndProportionStrings.a11y.explore.homeScreenDescription
    };

    super(
      () => new RatioAndProportionModel( tandem.createTandem( 'model' ) ),
      model => new ExploreScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'ExploreScreen', ExploreScreen );
export default ExploreScreen;