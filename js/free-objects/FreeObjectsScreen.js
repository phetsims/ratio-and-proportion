// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import RandomIcon from '../common/view/RandomIcon.js';
import proportion from '../proportion.js';
import FreeObjectsModel from './model/FreeObjectsModel.js';
import FreeObjectsScreenView from './view/FreeObjectsScreenView.js';

class FreeObjectsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      homeScreenIcon: new RandomIcon( 432140, 'free objects' ),
      name: 'Freely Moving Objects' // TODO: i18n
    };

    super(
      () => new FreeObjectsModel( tandem.createTandem( 'model' ) ),
      model => new FreeObjectsScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

proportion.register( 'FreeObjectsScreen', FreeObjectsScreen );
export default FreeObjectsScreen;