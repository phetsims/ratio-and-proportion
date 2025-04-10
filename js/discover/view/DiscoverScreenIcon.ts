// Copyright 2020-2025, University of Colorado Boulder

/**
 * The icon displayed on the HomeScreen for the Discover Screen
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import ScreenIcon, { ScreenIconOptions } from '../../../../joist/js/ScreenIcon.js';
import optionize from '../../../../phet-core/js/optionize.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import RAPColors from '../../common/view/RAPColors.js';
import RatioHandNode from '../../common/view/RatioHandNode.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';

type SelfOptions = {
  handColor?: Color;
};

class DiscoverScreenIcon extends ScreenIcon {

  public constructor( providedOptions?: ScreenIconOptions ) {

    const options = optionize<ScreenIconOptions, SelfOptions, ScreenIconOptions>()( {
      fill: 'white',
      handColor: RAPColors.discoverChallenge1Property.value
    }, providedOptions );

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