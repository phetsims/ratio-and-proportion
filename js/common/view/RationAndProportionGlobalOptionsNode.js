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
const RADIO_BUTTON_FONT = new PhetFont( 12 );

class RationAndProportionGlobalOptionsNode extends HBox {

  /**
   * @param {DesigningProperties} designingProperties
   */
  constructor( designingProperties ) {

    // set up a global variable to control this option (this is only acceptable because it's temporary code)
    const soundOptionsNode = new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'Staccato Success Sound:' ),
        new VerticalAquaRadioButtonGroup( designingProperties.inProportionSoundSelectorProperty, [ {
            node: new OptionsText( 'Single ding high note' ),
            value: 0
          }, {
            node: new OptionsText( 'Arpeggiated maj 7 chord' ),
            value: 1
          }, {
            node: new OptionsText( 'Fifths option1' ),
            value: 2
          }, {
            node: new OptionsText( 'Fifths option2' ),
            value: 3
          }, {
            node: new OptionsText( 'Fifths option3' ),
            value: 4
          }, {
            node: new OptionsText( 'Chord option1' ),
            value: 5
          }, {
            node: new OptionsText( 'Chord option2' ),
            value: 6
          }, {
            node: new OptionsText( 'Chord option3' ),
            value: 7
          } ]
        )
      ]
    } );

    const gridBaseAndVelocitySoundContent = new VBox( {
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
        } ),
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Velocity Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.movingInProportionSoundSelectorProperty, [ {
              node: new OptionsText( 'Choir (Ahhh)' ),
              value: 0
            }, {
              node: new OptionsText( 'Dream time' ),
              value: 1
            }, {
              node: new OptionsText( 'Peaceful tranquility' ),
              value: 2
            }, {
              node: new OptionsText( 'Choir/Peaceful tranquility blend' ),
              value: 3
            }, {
              node: new OptionsText( 'No sound' ),
              value: -1
            } ] )
          ]
        } )
      ]
    } );

    super( {
      children: [ soundOptionsNode, gridBaseAndVelocitySoundContent ],
      spacing: 30,
      align: 'top'
    } );
  }
}

class OptionsText extends RichText {constructor( text ) {super( text, { font: RADIO_BUTTON_FONT } );}}

ratioAndProportion.register( 'RationAndProportionGlobalOptionsNode', RationAndProportionGlobalOptionsNode );
export default RationAndProportionGlobalOptionsNode;