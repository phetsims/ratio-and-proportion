// Copyright 2020, University of Colorado Boulder

/**
 * TODO: remove once design is better established
 * TODO: if we keep it, name it like other sims, something like GlobalOptionsNode
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
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
                node: new OptionsText( 'Single high note' ),
                value: 0
              }, {
                node: new OptionsText( 'Arpeggiated maj 7 chord' ),
                value: 1
              } ]
            ) ]
        } ),
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Staccato Frequency Changes?' ),
            new VerticalAquaRadioButtonGroup( designingProperties.staccatoChangesFrequencyProperty, [ {
                node: new OptionsText( 'Yes' ),
                value: true
              }, {
                node: new OptionsText( 'No' ),
                value: false
              } ]
            ) ]
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
        } ),
        new VBox( {
          spacing: 10,
          align: 'left',
          children: [
            new RichText( 'Staccato Sound:' ),
            new VerticalAquaRadioButtonGroup( designingProperties.staccatoSoundSelectorProperty, [ {
              node: new OptionsText( 'Marimba' ),
              value: 0
            }, {
              node: new OptionsText( 'Random Mix' ),
              value: 1
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

ratioAndProportion.register( 'ProportionOptionsDialogContent', ProportionOptionsDialogContent );
export default ProportionOptionsDialogContent;