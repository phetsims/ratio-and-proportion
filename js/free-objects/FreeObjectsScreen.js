// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
*/

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import RandomIcon from '../free-objects/view/RandomIcon.js';
import ratioAndProportion from '../ratioAndProportion.js';
import FreeObjectsModel from './model/FreeObjectsModel.js';
import FreeObjectsScreenView from './view/FreeObjectsScreenView.js';

// TODO: rename to RatioScreen
class FreeObjectsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new ScreenIcon( new RandomIcon( 432140, 'free objects' ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      name: 'Freely Moving Objects' // TODO: i18n
    };

    super(
      () => new FreeObjectsModel( tandem.createTandem( 'model' ) ),
      model => new FreeObjectsScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'FreeObjectsScreen', FreeObjectsScreen );
export default FreeObjectsScreen;