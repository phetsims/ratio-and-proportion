// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import proportion from '../proportion.js';
import ProportionModel from './model/ProportionModel.js';
import ProportionScreenView from './view/ProportionScreenView.js';

class ProportionScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      tandem: tandem
    };

    super(
      () => new ProportionModel( tandem.createTandem( 'model' ) ),
      model => new ProportionScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

proportion.register( 'ProportionScreen', ProportionScreen );
export default ProportionScreen;