// Copyright 2020, University of Colorado Boulder

/**
 * Sim specific combo box item that includes a Node next to the text.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import HBox from '../../../../scenery/js/nodes/HBox.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class ChallengeComboBoxItem extends ComboBoxItem {

  /**
   * @param {string} text
   * @param {ColorDef} color
   * @param {number} value
   * @param {Object} [options]
   */
  constructor( text, color, value, options ) {
    super( new HBox( {
      spacing: 8,
      children: [
        new Rectangle( 0, 0, 15, 15, { fill: color } ),
        new RichText( text ) ]
    } ), value, options );
  }
}

ratioAndProportion.register( 'ChallengeComboBoxItem', ChallengeComboBoxItem );
export default ChallengeComboBoxItem;