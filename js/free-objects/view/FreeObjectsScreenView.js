// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ProportionConstants from '../../common/ProportionConstants.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ProportionFitnessSoundGenerator from './sound/ProportionFitnessSoundGenerator.js';
import ProportionMarkerInput from './ProportionMarkerInput.js';
import RatioHalf from './RatioHalf.js';
import MarkerDisplay from '../model/MarkerDisplay.js';
import GridViewProperties from './GridViewProperties.js';
import ProportionGridNode from './ProportionGridNode.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * .25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;

class FreeObjectsScreenView extends ScreenView {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const boundsInHalf = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );
    const leftRatioHalf = new RatioHalf(
      model.leftPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty,
      boundsInHalf, {
        left: LAYOUT_BOUNDS.left + ONE_QUARTER_LAYOUT_WIDTH
      }
    );
    const rightRatioHalf = new RatioHalf(
      model.rightPositionProperty, model.markerDisplayProperty,
      model.firstInteractionProperty,
      boundsInHalf, {
        left: leftRatioHalf.right
      }
    );

    super( {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS
    } );

    // @private
    this.markerInput = new ProportionMarkerInput( model );

    // @private
    this.proportionFitnessSoundGenerator = new ProportionFitnessSoundGenerator(
      model.proportionFitnessProperty,
      model.fitnessRange,
      DerivedProperty.or( [
        leftRatioHalf.isBeingInteractedWithProperty,
        rightRatioHalf.isBeingInteractedWithProperty,
        this.markerInput.isBeingInteractedWithProperty
      ] ) );
    soundManager.addSoundGenerator( this.proportionFitnessSoundGenerator );

    // @protected - for layout
    const ratioAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.ratioProperty, [ {
      node: new RichText( 'Mystery 1' ),
      value: 1 / 2
    }, {
      node: new RichText( 'Mystery 2' ),
      value: 1 / 3
    }, {
      node: new RichText( 'Mystery 3' ),
      value: 1 / 8
    }, {
      node: new RichText( 'Mystery 4' ),
      value: 5 / 6
    } ] );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    this.gridViewProperties = new GridViewProperties( tandem.createTandem( 'gridViewProperties' ) );

    const gridNode = new ProportionGridNode( this.gridViewProperties, 2 * RATIO_HALF_WIDTH, leftRatioHalf.height, {
      left: leftRatioHalf.left
    } );


    const background = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );

    background.moveToBack();

    model.colorProperty.link( color => {
      background.setFill( color );
    } );

    const markerDisplayAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( model.markerDisplayProperty, [ {
      node: new RichText( 'Hand' ),
      value: MarkerDisplay.HAND
    }, {
      node: new RichText( 'Circle' ),
      value: MarkerDisplay.CIRCLE
    }, {
      node: new RichText( 'Cross' ),
      value: MarkerDisplay.CROSS
    } ] );


    const gridDisplayAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( this.gridViewProperties.showVerticalGridLinesProperty, [ {
      node: new RichText( 'Horizontal' ),
      value: false
    }, {
      node: new RichText( 'Grid' ),
      value: true
    } ] );


    // TODO: implement grid numbers, https://github.com/phetsims/ratio-and-proportion/issues/5
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

    // layout
    resetAllButton.right = this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN;
    ratioAquaRadioButtonGroup.bottom = resetAllButton.top - 30;
    ratioAquaRadioButtonGroup.right = resetAllButton.right + 5;
    markerDisplayAquaRadioButtonGroup.left = gridDisplayAquaRadioButtonGroup.left = baseUnitAquaRadioButtonGroup.left = ratioAquaRadioButtonGroup.left;
    markerDisplayAquaRadioButtonGroup.bottom = ratioAquaRadioButtonGroup.top - 20;
    gridDisplayAquaRadioButtonGroup.bottom = markerDisplayAquaRadioButtonGroup.top - 20;
    baseUnitAquaRadioButtonGroup.bottom = gridDisplayAquaRadioButtonGroup.top - 20;

    // children
    this.children = [

      // background layers
      background,
      gridNode,

      // UI
      ratioAquaRadioButtonGroup,
      resetAllButton,
      baseUnitAquaRadioButtonGroup,
      markerDisplayAquaRadioButtonGroup,
      gridDisplayAquaRadioButtonGroup,

      // Main ratio on top
      leftRatioHalf,
      rightRatioHalf
    ];

    // accessible order
    this.pdomPlayAreaNode.accessibleOrder = [ leftRatioHalf, rightRatioHalf, null ]; // markers first is nav order
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

ratioAndProportion.register( 'FreeObjectsScreenView', FreeObjectsScreenView );
export default FreeObjectsScreenView;