// Copyright 2020, University of Colorado Boulder

/**
 * TODO: remove once design is better established
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import CursorDisplay from '../../common/CursorDisplay.js';
import ratioAndProportion from '../../ratioAndProportion.js';

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
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Ratio Fitness Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.proportionFitnessSoundSelectorProperty, [ {
                node: new OptionsText( 'Vibrato' ),
                value: 0
              }, {
                node: new OptionsText( 'C Major Sine' ),
                value: 2
              }, {
                node: new OptionsText( 'Staccato Marimba' ),
                value: 5
              }, {
                node: new OptionsText( 'Staccato Pizz C3' ),
                value: 6
              }, {
                node: new OptionsText( 'Staccato Pizz C4' ),
                value: 7
              }, {
                node: new OptionsText( 'No Sound' ),
                value: -1
              } ]
            ) ]
        } ),
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Staccato Success Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.staccatoSuccessSoundSelectorProperty, [ {
                node: new OptionsText( 'Tremolo to third' ),
                value: 0
              }, {
                node: new OptionsText( 'Single high note' ),
                value: 1
              }, {
                node: new OptionsText( 'Single major 7th chord' ),
                value: 2
              }, {
                node: new OptionsText( 'Single major chord' ),
                value: 3
              }, {
                node: new OptionsText( 'Single arpeggiated chord' ),
                value: 4
              } ]
            ) ]
        } )
      ]
    } );

    const ratioUISoundAndCursorContent = new VBox( {
      spacing: 15,
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
        } ), new VBox( {
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
        } )
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
        } ),
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Velocity Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.velocitySoundSelectorProperty, [ {
              node: new OptionsText( 'Strings' ),
              value: 0
            }, {
              node: new OptionsText( 'Choir (Ahhh)' ),
              value: 1
            }, {
              node: new OptionsText( 'No velocity sound' ),
              value: -1
            } ] )
          ]
        } )
      ]
    } );

    super( {
      children: [ soundOptionsNode, ratioUISoundAndCursorContent, gridBaseAndVelocitySoundContent ],
      spacing: 30,
      align: 'top'
    } );
  }
}

class OptionsText extends RichText {constructor( text ) {super( text, { font: RADIO_BUTTON_FONT } );}}

ratioAndProportion.register( 'ProportionOptionsDialogContent', ProportionOptionsDialogContent );
export default ProportionOptionsDialogContent;