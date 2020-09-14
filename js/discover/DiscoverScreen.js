// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import RAPModel from '../common/model/RAPModel.js';
import RandomIcon from '../common/view/RandomIcon.js';
import ratioAndProportion from '../ratioAndProportion.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';
import ratioAndProportionStrings from '../ratioAndProportionStrings.js';

class DiscoverScreen extends Screen {

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
      name: ratioAndProportionStrings.discover,
      descriptionContent: ratioAndProportionStrings.a11y.discover.homeScreenDescription
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