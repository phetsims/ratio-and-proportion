// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import proportion from '../proportion.js';
import BarModel from './model/BarModel.js';
import BarScreenView from './view/BarScreenView.js';

class BarScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem,
      name: 'Bars' // TODO: i18n
    };

    super(
      () => new BarModel( tandem.createTandem( 'model' ) ),
      model => new BarScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

proportion.register( 'BarScreen', BarScreen );
export default BarScreen;