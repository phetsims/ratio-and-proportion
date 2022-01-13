// Copyright 2020-2021, University of Colorado Boulder

/**
 * The icon displayed on the HomeScreen for the Discover Screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import RAPColors from '../../common/view/RAPColors.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';


class DiscoverScreenIcon extends ScreenIcon {

  /**
   * @param {Object} [options]
   */
  constructor( options?: any ) {

    options = merge( {
      fill: 'white',
      handColor: RAPColors.discoverChallenge1Property.value
    }, options );

    const tickMarksHiddenProperty = new EnumerationProperty( TickMarkView.NONE );

    const ratioHandNodeOptions = { handColor: options.handColor };

    const leftNode = new VBox( {
      children: [
        new Rectangle( 0, 0, 1, 15, { opacity: 0 } ),
        RatioHandNode.createIcon( false, tickMarksHiddenProperty, ratioHandNodeOptions )
      ]
    } );

    const rightNode = new VBox( {
      children: [
        RatioHandNode.createIcon( true, tickMarksHiddenProperty, ratioHandNodeOptions ),
        new Rectangle( 0, 0, 1, 15, { opacity: 0 } )
      ]
    } );

    super( new HBox( {
      spacing: 10,
      children: [ leftNode, rightNode ]
    } ), options );
  }
}

ratioAndProportion.register( 'DiscoverScreenIcon', DiscoverScreenIcon );
export default DiscoverScreenIcon;