// Copyright 2020-2024, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RAPModel from '../common/model/RAPModel.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RatioAndProportionStrings from '../RatioAndProportionStrings.js';
import DiscoverScreenIcon from './view/DiscoverScreenIcon.js';
import DiscoverScreenKeyboardHelpContent from './view/DiscoverScreenKeyboardHelpContent.js';
import DiscoverScreenView from './view/DiscoverScreenView.js';

class DiscoverScreen extends Screen<RAPModel, DiscoverScreenView> {

  public constructor( tandem: Tandem ) {

    const backgroundColorProperty = new Property( Color.WHITE );
    const options = {
      backgroundColorProperty: backgroundColorProperty,
      tandem: tandem,
      homeScreenIcon: new DiscoverScreenIcon(),
      name: RatioAndProportionStrings.screen.discoverStringProperty,
      screenButtonsHelpText: RatioAndProportionStrings.a11y.discover.screenButtonsHelpTextStringProperty,
      createKeyboardHelpNode: () => new DiscoverScreenKeyboardHelpContent()
    };

    super(
      () => new RAPModel( tandem.createTandem( 'model' ) ),
      model => new DiscoverScreenView( model, backgroundColorProperty, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

ratioAndProportion.register( 'DiscoverScreen', DiscoverScreen );
export default DiscoverScreen;