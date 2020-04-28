// Copyright 2020, University of Colorado Boulder

/**
 * TODO: remove once sound design is better established, see https://github.com/phetsims/ratio-and-proportion/issues/9
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import MarkerDisplay from '../model/MarkerDisplay.js';

// constants
const RADIO_BUTTON_FONT = new PhetFont( 12 );

class ProportionOptionsDialogContent extends HBox {

  constructor( soundModeProperty ) {

    // set up a global variable to control this option (this is only acceptable because it's temporary code)
    const soundOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Sound Options:' ),
        new AquaRadioButtonGroup( soundModeProperty, [ {
            node: new Text( 'Vibrato', { font: RADIO_BUTTON_FONT } ),
            value: 0
          }, {
            node: new Text( 'Random Clicks', { font: RADIO_BUTTON_FONT } ),
            value: 1
          }, {
            node: new Text( 'C Major Sine', { font: RADIO_BUTTON_FONT } ),
            value: 2
          }, {
            node: new Text( 'Single Pitch change', { font: RADIO_BUTTON_FONT } ),
            value: 3
          } ], { spacing: 13 }
        ) ]
    } );

    const cursorOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Cursor Options:' ),
        new VerticalAquaRadioButtonGroup( window.phet.ratioAndProportion.markerDisplayProperty, [ {
          node: new RichText( 'Hand' ),
          value: MarkerDisplay.HAND
        }, {
          node: new RichText( 'Circle' ),
          value: MarkerDisplay.CIRCLE
        }, {
          node: new RichText( 'Cross' ),
          value: MarkerDisplay.CROSS
        } ] )
      ]
    } );

    super( {
      children: [ soundOptionsNode, cursorOptionsNode ],
      spacing: 30,
      align: 'top'
    } );
  }
}

ratioAndProportion.register( 'ProportionOptionsDialogContent', ProportionOptionsDialogContent );
export default ProportionOptionsDialogContent;