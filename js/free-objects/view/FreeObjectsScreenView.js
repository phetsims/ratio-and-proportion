// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ProportionConstants from '../../common/ProportionConstants.js';
import proportion from '../../proportion.js';
import DraggableMarker from './DraggableMarker.js';
import MarkerDisplay from '../model/MarkerDisplay.js';

class FreeObjectsScreenView extends ScreenView {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    const background = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );

    model.colorProperty.link( color => {
      background.setFill( color );
    } );

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( this.layoutBounds.centerX, this.layoutBounds.bottom ),
      1000
    );

    const leftMarker = new DraggableMarker(
      model.leftPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty, modelViewTransform, this.layoutBounds
    );
    const rightMarker = new DraggableMarker(
      model.rightPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty, modelViewTransform, this.layoutBounds
    );

    const toleranceNumberControl = new NumberControl( 'Tolerance', model.toleranceProperty, new Range( 0.01, .3 ), {
      delta: .01,
      numberDisplayOptions: {
        decimalPlaces: 2
      },
      sliderOptions: {
        keyboardStep: .05
      }
    } );

    const ratioAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.ratioProperty, [ {
      node: new RichText( 'Mystery 1' ),
      value: 1 / 2
    }, {
      node: new RichText( 'Mystery 2' ),
      value: 1 / 3
    }, {
      node: new RichText( 'Mystery 3' ),
      value: 4
    }, {
      node: new RichText( 'Mystery 4' ),
      value: 1 / 8
    }, {
      node: new RichText( 'Mystery 5' ),
      value: 5 / 6
    } ] );

    const markerDisplayAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.markerDisplayProperty, [ {
      node: new RichText( 'Circle' ),
      value: MarkerDisplay.CIRCLE
    }, {
      node: new RichText( 'Cross' ),
      value: MarkerDisplay.CROSS
    } ] );


    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );


    // layout
    resetAllButton.right = this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN;
    ratioAquaRadioButtonGroup.bottom = resetAllButton.top - 50;
    ratioAquaRadioButtonGroup.left = rightMarker.right + 30;
    toleranceNumberControl.bottom = ratioAquaRadioButtonGroup.top - 20;
    toleranceNumberControl.left = markerDisplayAquaRadioButtonGroup.left = ratioAquaRadioButtonGroup.left;
    markerDisplayAquaRadioButtonGroup.bottom = resetAllButton.bottom;

    // children
    this.children = [
      background,
      leftMarker,
      rightMarker,
      toleranceNumberControl,
      ratioAquaRadioButtonGroup,
      markerDisplayAquaRadioButtonGroup,
      resetAllButton
    ];
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //TODO
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    //TODO
  }
}

proportion.register( 'FreeObjectsScreenView', FreeObjectsScreenView );
export default FreeObjectsScreenView;