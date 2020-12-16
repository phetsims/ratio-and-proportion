// Copyright 2020, University of Colorado Boulder

/**
 * The icon displayed on the HomeScreen for the Create Screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range from '../../../../dot/js/Range.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import RAPColorProfile from '../../common/view/RAPColorProfile.js';
import ratioAndProportion from '../../ratioAndProportion.js';


class CreateScreenIcon extends ScreenIcon {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    const numberPickerColor = RAPColorProfile.createScreenHandProperty;
    const numberPickerRange = new Range( 0, 10 );

    const leftNode = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        NumberPicker.createIcon( 3, {
          range: numberPickerRange,
          numberPickerOptions: {
            color: numberPickerColor
          }
        } )
      ]
    } );

    const rightNode = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        NumberPicker.createIcon( 2, {
          highlightIncrement: true,
          range: numberPickerRange,
          numberPickerOptions: {
            color: numberPickerColor
          }
        } )
      ]
    } );

    super( new HBox( {
      spacing: 10,
      children: [ leftNode, rightNode ]
    } ), options );
  }
}

ratioAndProportion.register( 'CreateScreenIcon', CreateScreenIcon );
export default CreateScreenIcon;