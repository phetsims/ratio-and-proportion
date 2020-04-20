// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import ProportionScreenView from '../../common/view/ProportionScreenView.js';
import proportion from '../../proportion.js';
import DraggableMarker from './DraggableMarker.js';
import MarkerDisplay from '../model/MarkerDisplay.js';
import GridViewProperties from './GridViewProperties.js';
import ProportionGridNode from './ProportionGridNode.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;

class FreeObjectsScreenView extends ProportionScreenView {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const boundsInHalf = Bounds2.rect( 0, 0, LAYOUT_BOUNDS.width * ( 4 / 9 ), LAYOUT_BOUNDS.height );
    const leftMarker = new DraggableMarker(
      model.leftPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty,
      boundsInHalf, {
        left: LAYOUT_BOUNDS.left
      }
    );
    const rightMarker = new DraggableMarker(
      model.rightPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty,
      boundsInHalf, {
        left: leftMarker.right
      }
    );

    super( model, leftMarker, rightMarker, {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS
    } );

    this.gridViewProperties = new GridViewProperties( tandem.createTandem( 'gridViewProperties' ) );

    assert && assert( leftMarker.height === rightMarker.height, 'heights should be the same' );
    const gridNode = new ProportionGridNode( this.gridViewProperties, leftMarker.width + rightMarker.width, leftMarker.height );
    this.addChild( gridNode );

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

    const gridDisplayAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( this.gridViewProperties.showVerticalGridLinesProperty, [ {
      node: new RichText( 'Horizontal' ),
      value: false
    }, {
      node: new RichText( 'Grid' ),
      value: true
    } ] );
    this.addChild( gridDisplayAquaRadioButtonGroup );


    // TODO: implement grid numbers, https://github.com/phetsims/proportion/issues/5
    // const showUnitsAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( this.gridViewProperties.showGridUnitsProperty, [ {
    //   node: new RichText( 'Grid Numbers' ),
    //   value: true
    // }, {
    //   node: new RichText( 'None' ),
    //   value: false
    // } ] );
    // this.addChild( showUnitsAquaRadioButtonGroup );

    const baseUnitAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( this.gridViewProperties.gridBaseUnitProperty, [ {
      node: new RichText( 'a:b' ),
      value: 10
    }, {
      node: new RichText( '2a:2b' ),
      value: 20
    }, {
      node: new RichText( '3a:3b' ),
      value: 30
    }, {
      node: new RichText( '4a:4b' ),
      value: 40
    } ] );
    this.addChild( baseUnitAquaRadioButtonGroup );

    // layout
    markerDisplayAquaRadioButtonGroup.left = gridDisplayAquaRadioButtonGroup.left = baseUnitAquaRadioButtonGroup.left = this.ratioAquaRadioButtonGroup.left;
    markerDisplayAquaRadioButtonGroup.bottom = this.ratioAquaRadioButtonGroup.top - 20;
    gridDisplayAquaRadioButtonGroup.bottom = markerDisplayAquaRadioButtonGroup.top - 20;
    baseUnitAquaRadioButtonGroup.bottom = gridDisplayAquaRadioButtonGroup.top - 20;
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.gridViewProperties.reset();
  }

  /**
   * @override
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