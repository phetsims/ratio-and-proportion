// Copyright 2020, University of Colorado Boulder

/**
 * TODO: remove once sound design is better established, see https://github.com/phetsims/ratio-and-proportion/issues/9
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import CursorDisplay from '../../common/CursorDisplay.js';

// constants
const RADIO_BUTTON_FONT = new PhetFont( 12 );

class ProportionOptionsDialogContent extends HBox {

  /**
   * @param {DesigningProperties} designingProperties
   */
  constructor( designingProperties ) {

    // set up a global variable to control this option (this is only acceptable because it's temporary code)
    const soundOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Sound:' ),
        new VerticalAquaRadioButtonGroup( designingProperties.proportionFitnessSoundSelectorProperty, [ {
            node: new OptionsText( 'Vibrato' ),
            value: 0
          }, {
            node: new OptionsText( 'Random Clicks' ),
            value: 1
          }, {
            node: new OptionsText( 'C Major Sine' ),
            value: 2
          }, {
            node: new OptionsText( 'Single Pitch change' ),
            value: 3
          } ]
        ) ]
    } );

    const cursorOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Cursor:' ),
        new VerticalAquaRadioButtonGroup( designingProperties.markerDisplayProperty, [ {
          node: new OptionsText( 'Hand' ),
          value: CursorDisplay.HAND
        }, {
          node: new OptionsText( 'Circle' ),
          value: CursorDisplay.CIRCLE
        }, {
          node: new OptionsText( 'Cross' ),
          value: CursorDisplay.CROSS
        } ] )
      ]
    } );

    const gridBaseUnitOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Grid Base Unit:' ),
        new VerticalAquaRadioButtonGroup( designingProperties.gridBaseUnitProperty, [ {
          node: new OptionsText( 'a:b' ),
          value: 10
        }, {
          node: new OptionsText( '2a:2b' ),
          value: 20
        }, {
          node: new OptionsText( '3a:3b' ),
          value: 30
        }, {
          node: new OptionsText( '4a:4b' ),
          value: 40
        } ] )
      ]
    } );

    super( {
      children: [ soundOptionsNode, cursorOptionsNode, gridBaseUnitOptionsNode ],
      spacing: 30,
      align: 'top'
    } );
  }
}

class OptionsText extends RichText {constructor( text ) {super( text, { font: RADIO_BUTTON_FONT } );}}

ratioAndProportion.register( 'ProportionOptionsDialogContent', ProportionOptionsDialogContent );
export default ProportionOptionsDialogContent;