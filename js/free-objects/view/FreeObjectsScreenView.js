// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ProportionScreenView from '../../common/view/ProportionScreenView.js';
import proportion from '../../proportion.js';
import DraggableMarker from './DraggableMarker.js';
import MarkerDisplay from '../model/MarkerDisplay.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;

class FreeObjectsScreenView extends ProportionScreenView {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( LAYOUT_BOUNDS.centerX, LAYOUT_BOUNDS.bottom ),
      1000
    );

    const leftMarker = new DraggableMarker(
      model.leftPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty, modelViewTransform, LAYOUT_BOUNDS
    );
    const rightMarker = new DraggableMarker(
      model.rightPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty, modelViewTransform, LAYOUT_BOUNDS
    );

    super( model, leftMarker, rightMarker, {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS
    } );

    const background = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );
    this.addChild( background );
    background.moveToBack();

    model.colorProperty.link( color => {
      background.setFill( color );
    } );

    const markerDisplayAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.markerDisplayProperty, [ {
      node: new RichText( 'Circle' ),
      value: MarkerDisplay.CIRCLE
    }, {
      node: new RichText( 'Cross' ),
      value: MarkerDisplay.CROSS
    } ] );

    this.addChild( markerDisplayAquaRadioButtonGroup );

    // layout
    markerDisplayAquaRadioButtonGroup.left = this.ratioAquaRadioButtonGroup.left;
    markerDisplayAquaRadioButtonGroup.bottom = this.resetAllButton.bottom;
  }

  /**
   * @public
   * @param {number} dt
   */
  step( dt ) {
    this.markerInput.step( dt );
    this.proportionFitnessSoundGenerator.step( dt );
  }
}

proportion.register( 'FreeObjectsScreenView', FreeObjectsScreenView );
export default FreeObjectsScreenView;