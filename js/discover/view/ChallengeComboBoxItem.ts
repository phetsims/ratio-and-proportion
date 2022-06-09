// Copyright 2020-2022, University of Colorado Boulder

/**
 * Sim specific combo box item that includes a colorful square next to the text.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Color, HBox, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import ComboBoxItem, { ComboBoxItemOptions } from '../../../../sun/js/ComboBoxItem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';

class ChallengeComboBoxItem extends ComboBoxItem<number> {

  public constructor( text: string, color: Color, value: number, valueProperty: NumberProperty,
               colorProperty: Property<Color>, options?: ComboBoxItemOptions ) {
    super( new HBox( {
      spacing: 8,
      children: [
        new Rectangle( 0, 0, 15, 15, { fill: color } ),
        new RichText( text ) ]
    } ), value, options );

    valueProperty.link( newValue => {
      if ( newValue === value ) {
        colorProperty.value = color;
      }
    } );
  }
}

ratioAndProportion.register( 'ChallengeComboBoxItem', ChallengeComboBoxItem );
export default ChallengeComboBoxItem;