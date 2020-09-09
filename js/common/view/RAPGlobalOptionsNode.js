// Copyright 2020, University of Colorado Boulder

/**
 * Global options for RaP, mostly just for designing and will likely not stick around to production.
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// constants
const RADIO_BUTTON_FONT = new PhetFont( 16 );

class RAPGlobalOptionsNode extends HBox {

  /**
   * @param {DesigningProperties} designingProperties
   */
  constructor( designingProperties ) {

    const tickMarkBaseAndVelocitySoundContent = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Ratio UI Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.ratioUISoundsEnabledProperty, [ {
              node: new OptionsText( 'Enabled' ),
              value: true
            }, {
              node: new OptionsText( 'Disabled' ),
              value: false
            } ] )
          ]
        } ) ]
    } );

    super( {
      children: [ tickMarkBaseAndVelocitySoundContent ],
      spacing: 30,
      align: 'top'
    } );
  }
}

class OptionsText extends RichText {constructor( text ) {super( text, { font: RADIO_BUTTON_FONT } );}}

ratioAndProportion.register( 'RAPGlobalOptionsNode', RAPGlobalOptionsNode );
export default RAPGlobalOptionsNode;