// Copyright 2020, University of Colorado Boulder

/**
 * TODO: remove once sound design is better established, see https://github.com/phetsims/proportion/issues/9
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import proportion from '../../proportion.js';

// constants
const RADIO_BUTTON_FONT = new PhetFont( 12 );

class ProportionOptionsDialogContent extends Node {

  constructor( soundModeProperty ) {

    // set up a global variable to control this option (this is only acceptable because it's temporary code)
    const radioButtonsGroup = new AquaRadioButtonGroup(
      soundModeProperty,
      [
        {
          node: new Text( 'Proportion-Vibrato', { font: RADIO_BUTTON_FONT } ),
          value: 0
        },
        {
          node: new Text( 'Proportion-Random Clicks', { font: RADIO_BUTTON_FONT } ),
          value: 1
        },
        {
          node: new Text( 'Proportion_C_Major_Sine (maybe)', { font: RADIO_BUTTON_FONT } ),
          value: 2
        },{
          node: new Text( 'Test with pitch', { font: RADIO_BUTTON_FONT } ),
          value: 3
        }
      ],
      {
        spacing: 13
      }
    );

    super( { children: [ radioButtonsGroup ] } );
  }
}

proportion.register( 'ProportionOptionsDialogContent', ProportionOptionsDialogContent );
export default ProportionOptionsDialogContent;