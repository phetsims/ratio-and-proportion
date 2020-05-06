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
import Node from '../../../../scenery/js/nodes/Node.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ProportionConstants from '../../common/ProportionConstants.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import ChallengeComboBoxItem from './ChallengeComboBoxItem.js';
import RatioAndProportionScreenSummaryNode from './RatioAndProportionScreenSummaryNode.js';
import RatioDescriber from './RatioDescriber.js';
import ProportionFitnessSoundGenerator from './sound/ProportionFitnessSoundGenerator.js';
import ProportionMarkerInput from './ProportionMarkerInput.js';
import RatioHalf from './RatioHalf.js';
import GridView from './GridView.js';
import GridViewProperties from './GridViewProperties.js';
import ProportionGridNode from './ProportionGridNode.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MAX_RATIO_HEIGHT = LAYOUT_BOUNDS.width * 2; // relatively arbitrary, but good to set a max so it can't get too skinny
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * .25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;
const RATIO_HALF_SPACING = 20;

class FreeObjectsScreenView extends ScreenView {

  /**
   * @param {FreeObjectsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    const ratioDescriber = new RatioDescriber( model );

    super( {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS,
      screenSummaryContent: new RatioAndProportionScreenSummaryNode(
        model.proportionFitnessProperty,
        model.leftValueProperty,
        model.rightValueProperty,
        ratioDescriber
      )
    } );

    // @private
    this.gridViewProperties = new GridViewProperties( tandem.createTandem( 'gridViewProperties' ) );

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    const leftRatioHalf = new RatioHalf(
      model.leftPositionProperty,
      model.firstInteractionProperty,
      defaultRatioHalfBounds,
      this.gridViewProperties.gridViewProperty, {
        labelContent: ratioAndProportionStrings.a11y.leftHand,
        isRight: false // this way we get a left hand
      }
    );

    const rightRatioHalf = new RatioHalf(
      model.rightPositionProperty,
      model.firstInteractionProperty,
      defaultRatioHalfBounds,
      this.gridViewProperties.gridViewProperty, {
        labelContent: ratioAndProportionStrings.a11y.rightHand
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

    const comboBoxParent = new Node();

    const comboBox = new ComboBox( [
      new ChallengeComboBoxItem( 'Challenge 1', 'green', 1 / 2 ),
      new ChallengeComboBoxItem( 'Challenge 2', 'blue', 1 / 3 ),
      new ChallengeComboBoxItem( 'Challenge 3', 'magenta', 3 / 4 )
    ], model.ratioProperty, comboBoxParent );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // these dimensions are just temporary, and will be recomputed below in the layout function
    const gridNode = new ProportionGridNode( this.gridViewProperties, 100, 100 );

    const backgroundNode = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );
    model.colorProperty.link( color => {
      backgroundNode.setFill( color );
    } );

    const gridViewAquaRadioButtonGroup = new VerticalAquaRadioButtonGroup( this.gridViewProperties.gridViewProperty, [ {
      node: new RichText( 'None' ),
      value: GridView.NONE,
      labelContent: ratioAndProportionStrings.a11y.grid.showNo
    }, {
      node: new RichText( 'Grid' ),
      value: GridView.HORIZONTAL,
      labelContent: ratioAndProportionStrings.a11y.grid.show
    }, {
      node: new RichText( 'Numbered Grid' ),
      value: GridView.HORIZONTAL_UNITS,
      labelContent: ratioAndProportionStrings.a11y.grid.showNumbered
    } ], {
      labelContent: ratioAndProportionStrings.a11y.grid.heading
    } );

    // children
    this.children = [
      backgroundNode,
      gridNode,

      // UI
      comboBox,
      resetAllButton,
      gridViewAquaRadioButtonGroup,

      // list box above other UI
      comboBoxParent,

      // Main ratio on top
      leftRatioHalf,
      rightRatioHalf
    ];

    // accessible order
    this.pdomPlayAreaNode.accessibleOrder = [ leftRatioHalf, rightRatioHalf, null ]; // markers first is nav order

    // static layout
    resetAllButton.right = this.layoutBounds.maxX - ProportionConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - ProportionConstants.SCREEN_VIEW_Y_MARGIN;
    comboBox.bottom = resetAllButton.top - 140;
    comboBox.right = resetAllButton.right + 5;
    gridViewAquaRadioButtonGroup.left = comboBox.left;
    gridViewAquaRadioButtonGroup.bottom = comboBox.top - RATIO_HALF_SPACING;

    // @private - dynamic layout based on the current ScreenView coordinates
    this.layoutFreeObjectsScreenView = newRatioHalfBounds => {

      leftRatioHalf.layout( newRatioHalfBounds );
      rightRatioHalf.layout( newRatioHalfBounds );
      backgroundNode.rectHeight = newRatioHalfBounds.height;
      backgroundNode.bottom = this.layoutBounds.bottom;

      const ratioWidth = leftRatioHalf.width + rightRatioHalf.width + RATIO_HALF_SPACING;

      // subtract the top and bottom rectangles from the grid height
      gridNode.layout( ratioWidth, newRatioHalfBounds.height - 2 * RatioHalf.FRAMING_RECTANGLE_HEIGHT );

      // combo box is a proxy for the width of the controls
      leftRatioHalf.left = gridNode.left = ( this.layoutBounds.width - comboBox.width - ratioWidth ) / 2;
      rightRatioHalf.left = leftRatioHalf.right + RATIO_HALF_SPACING;
      leftRatioHalf.bottom = rightRatioHalf.bottom = this.layoutBounds.bottom;
      gridNode.bottom = this.layoutBounds.bottom - RatioHalf.FRAMING_RECTANGLE_HEIGHT;
    };
    this.layoutFreeObjectsScreenView( defaultRatioHalfBounds );
  }

  /**
   * Layout Nodes part of ethe screen viw. To accomplish, much of this was copied from ScreenView.layout, with
   * minor tweaks for this specific case. Also note Projectile Motion uses almost the exact same algorithm.
   *
   * @param {number} width
   * @param {number} height
   * @override
   * @public
   */
  layout( width, height ) {
    this.resetTransform();

    const scale = this.getLayoutScale( width, height );
    this.setScaleMagnitude( scale );

    let dx = 0;
    let dy = 0;

    // Move to bottom vertically
    if ( scale === width / this.layoutBounds.width ) {
      dy = ( height / scale - this.layoutBounds.height );
    }

    // Center horizontally
    else if ( scale === height / this.layoutBounds.height ) {
      dx = ( width / scale - this.layoutBounds.width ) / 2;
    }
    this.translate( dx, dy );

    // set visible bounds, which are different from layout bounds
    this.visibleBoundsProperty.set( new Bounds2( -dx, -dy, width / scale - dx, height / scale - dy ) );

    // new bounds for each ratio half
    this.layoutFreeObjectsScreenView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, Math.min( height / scale, MAX_RATIO_HEIGHT ) ) );
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