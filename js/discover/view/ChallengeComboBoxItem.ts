// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific combo box item that includes a colorful square next to the text.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import HBox from '../../../../scenery/js/nodes/HBox.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import Color from '../../../../scenery/js/util/Color.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';

class ChallengeComboBoxItem extends ComboBoxItem {

  /**
   * @param {string} text
   * @param {ColorDef} color
   * @param {number} value
   * @param {NumberProperty} valueProperty
   * @param {Property.<ColorDef>} colorProperty - when the valueProperty is set to this item's value, change this color
   * to match this item's color too.
   * @param {Object} [options]
   */
  constructor( text: string, color: Color | string, value: number, valueProperty: NumberProperty,
               colorProperty: Property<Color | string>, options?: any ) {
    super( new HBox( {
      spacing: 8,
      children: [
        new Rectangle( 0, 0, 15, 15, { fill: color } ),
        new RichText( text ) ]
    } ), value, options );

    valueProperty.link( ( newValue: number ) => {
      if ( newValue === value ) {
        colorProperty.value = color;
      }
    } );
  }
}

ratioAndProportion.register( 'ChallengeComboBoxItem', ChallengeComboBoxItem );
export default ChallengeComboBoxItem;