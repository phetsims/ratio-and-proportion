// Copyright 2020, University of Colorado Boulder

/**
 * The icon displayed on the HomeScreen for the Create Screen
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberPicker from '../../../../scenery-phet/js/NumberPicker.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import RAPColorProfile from '../../common/view/RAPColorProfile.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';


class CreateScreenIcon extends ScreenIcon {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      fill: RAPColorProfile.backgroundInFitnessProperty.value
    }, options );

    const tickMarksHiddenProperty = new Property( TickMarkView.NONE );

    const leftNode = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( false, tickMarksHiddenProperty ),
        new NumberPicker( new NumberProperty( 1 ), new Property( new Range( 1, 10 ) ) )
      ]
    } );

    const rightNode = new VBox( {
      align: 'center',
      spacing: 10,
      children: [
        RatioHandNode.createIcon( true, tickMarksHiddenProperty ),
        new NumberPicker( new NumberProperty( 2 ), new Property( new Range( 1, 10 ) ) )
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