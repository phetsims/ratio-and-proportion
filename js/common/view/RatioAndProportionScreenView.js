// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import A11yBehaviorFunctionDef from '../../../../scenery/js/accessibility/A11yBehaviorFunctionDef.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import gridIconImage from '../../../images/grid-icon_png.js';
import numberedGridIconImage from '../../../images/numbered-grid-icon_png.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioAndProportionConstants from '../RatioAndProportionConstants.js';
import GridDescriber from './GridDescriber.js';
import GridView from './GridView.js';
import HandPositionsDescriber from './HandPositionsDescriber.js';
import RAPGridLabelsNode from './RAPGridLabelsNode.js';
import RatioAndProportionColorProfile from './RatioAndProportionColorProfile.js';
import RatioDescriber from './RatioDescriber.js';
import RatioHalf from './RatioHalf.js';
import RatioInteractionListener from './RatioInteractionListener.js';
import ProportionFitnessSoundGenerator from './sound/ProportionFitnessSoundGenerator.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MAX_RATIO_HEIGHT = LAYOUT_BOUNDS.width * 2; // relatively arbitrary, but good to set a max so it can't get too skinny
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * .25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;
const RATIO_HALF_SPACING = 10;
const CONTROL_PANEL_WIDTH = 200;

class RatioAndProportionScreenView extends ScreenView {

  /**
   * @param {RatioAndProportionModel} model
   * @param {Tandem} tandem
   * @param options
   */
  constructor( model, tandem, options ) {

    options = merge( {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS,

      // What is the unit value of the grid. Value reads as "1/x of the view height." This type is responsible for
      // resetting this on reset all.
      gridRangeProperty: new NumberProperty( 10 )
    }, options );

    const gridAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => Color.interpolateRGBA(
        RatioAndProportionColorProfile.gridAndLabelsInFitnessProperty.value,
        RatioAndProportionColorProfile.gridAndLabelsOutOfFitnessProperty.value, fitness
      ) );

    const gridViewProperty = new EnumerationProperty( GridView, GridView.NONE, {
      tandem: tandem.createTandem( 'gridViewProperty' )
    } );

    super( options );

    const gridDescriber = new GridDescriber( model.valueRange, options.gridRangeProperty );

    // @protected (read-only)
    this.ratioDescriber = new RatioDescriber( model );
    this.handPositionsDescriber = new HandPositionsDescriber( model.leftValueProperty, model.rightValueProperty, model.valueRange, gridDescriber );

    // @protected
    this.gridViewProperty = gridViewProperty;

    // by default, the keyboard step size should be half of one default grid line width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    const keyboardStep = 1 / 2 / options.gridRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ gridViewProperty, options.gridRangeProperty, model.targetRatioProperty ];

    const playUISoundsProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => fitness === model.fitnessRange.min || model.inProportion() );

    // @private {RatioHalf}
    this.leftRatioHalf = new RatioHalf(
      model.leftValueProperty,
      model.valueRange,
      model.enabledValueRangeProperty,
      model.firstInteractionProperty,
      defaultRatioHalfBounds,
      gridViewProperty,
      options.gridRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      gridAndLabelsColorProperty,
      keyboardStep,
      model.lockRatioProperty,
      playUISoundsProperty, {
        accessibleName: ratioAndProportionStrings.a11y.leftHand,
        a11yDependencies: a11yDependencies,
        isRight: false // this way we get a left hand
      }
    );

    // @private {RatioHalf}
    this.rightRatioHalf = new RatioHalf(
      model.rightValueProperty,
      model.valueRange,
      model.enabledValueRangeProperty,
      model.firstInteractionProperty,
      defaultRatioHalfBounds,
      gridViewProperty,
      options.gridRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      gridAndLabelsColorProperty,
      keyboardStep,
      model.lockRatioProperty,
      playUISoundsProperty, {
        accessibleName: ratioAndProportionStrings.a11y.rightHand,
        a11yDependencies: a11yDependencies,
        helpText: ratioAndProportionStrings.a11y.rightHandHelpText
      } );

    // TODO: this should probably be its own class
    const bothHandsInteractionNode = new Node( {
      ariaRole: 'application',
      focusable: true,
      tagName: 'div',
      innerContent: ratioAndProportionStrings.a11y.bothHands,
      ariaLabel: ratioAndProportionStrings.a11y.bothHands,
      helpText: ratioAndProportionStrings.a11y.bothHandsHelpText,
      children: [
        this.leftRatioHalf,
        this.rightRatioHalf
      ]
    } );
    bothHandsInteractionNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( bothHandsInteractionNode, model.leftValueProperty,
      model.rightValueProperty, model.valueRange, model.firstInteractionProperty, options.gridRangeProperty, keyboardStep );
    bothHandsInteractionNode.addInputListener( ratioInteractionListener );

    const bothHandsPositionUtterance = new Utterance( {

      // give enough time for the user to stop interacting with te hands
      // before describing current positions, to prevent too many of these
      // from queuing up in rapid presses
      alertStableDelay: 500
    } );
    const bothHandsRatioUtterance = new Utterance( {

      // a longer delay before speaking the bothHandsPositionUtterance gives
      // more consistent behavior on Safari, where often the alerts would be
      // lost
      alertStableDelay: 1000
    } );
    ratioInteractionListener.isBeingInteractedWithProperty.lazyLink( isBeingInteractedWith => {

      // when no longer being interacted with, trigger an alert
      if ( !isBeingInteractedWith ) {
        bothHandsPositionUtterance.alert = this.handPositionsDescriber.getBothHandsPositionText( gridViewProperty.value );
        phet.joist.sim.utteranceQueue.addToBack( bothHandsPositionUtterance );

        bothHandsRatioUtterance.alert = this.ratioDescriber.getRatioDescriptionString();
        phet.joist.sim.utteranceQueue.addToBack( bothHandsRatioUtterance );
      }
    } );

    // @private TODO: add support for mechamarker input again https://github.com/phetsims/ratio-and-proportion/issues/89
    // this.markerInput = new ProportionMarkerInput( model );

    // @private
    this.proportionFitnessSoundGenerator = new ProportionFitnessSoundGenerator(
      model.ratioFitnessProperty,
      model.fitnessRange,
      DerivedProperty.or( [
        this.leftRatioHalf.isBeingInteractedWithProperty,
        this.rightRatioHalf.isBeingInteractedWithProperty,
        // this.markerInput.isBeingInteractedWithProperty, // TODO: add support for mechamarker input again https://github.com/phetsims/ratio-and-proportion/issues/89
        ratioInteractionListener.isBeingInteractedWithProperty
      ] ),
      model );
    soundManager.addSoundGenerator( this.proportionFitnessSoundGenerator );

    // these dimensions are just temporary, and will be recomputed below in the layout function
    const labelsNode = new RAPGridLabelsNode( gridViewProperty, options.gridRangeProperty, 1000, gridAndLabelsColorProperty );

    const backgroundNode = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );

    model.ratioFitnessProperty.link( fitness => {
      let color = null;
      if ( model.inProportion() ) {
        color = RatioAndProportionColorProfile.backgroundInFitnessProperty.value;
      }
      else {
        color = Color.interpolateRGBA(
          RatioAndProportionColorProfile.backgroundOutOfFitnessProperty.value,
          RatioAndProportionColorProfile.backgroundInterpolationToFitnessProperty.value,
          ( fitness - model.fitnessRange.min ) / ( 1 - model.getInProportionThreshold() )
        );
      }
      backgroundNode.setFill( color );
    } );

    // @protected - used only for subtype layout
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        options.gridRangeProperty.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // @protected - subtype is responsible for layout
    this.gridViewRadioButtonGroup = new RadioButtonGroup( gridViewProperty, [ {
      node: new FontAwesomeNode( 'eye_close', { scale: 0.8 } ),
      value: GridView.NONE,
      labelContent: ratioAndProportionStrings.a11y.grid.showNo
    }, {
      node: new Image( gridIconImage, { scale: .2 } ),
      value: GridView.HORIZONTAL,
      labelContent: ratioAndProportionStrings.a11y.grid.show
    }, {
      node: new Image( numberedGridIconImage, { scale: .2 } ),
      value: GridView.HORIZONTAL_UNITS,
      labelContent: ratioAndProportionStrings.a11y.grid.showNumbered
    } ], {
      orientation: 'horizontal',
      baseColor: 'white',
      labelContent: ratioAndProportionStrings.a11y.grid.heading,
      helpText: ratioAndProportionStrings.a11y.grid.helpText,
      helpTextBehavior: A11yBehaviorFunctionDef.HELP_TEXT_BEFORE_CONTENT,
      scale: 1.07 // calculated to try to match this width with other components in subtypes
    } );

    // children
    this.children = [
      backgroundNode,
      labelsNode,

      // UI
      this.gridViewRadioButtonGroup,
      this.resetAllButton,

      // Main ratio on top
      bothHandsInteractionNode
    ];

    // accessible order (ratio first in nav order)
    this.pdomPlayAreaNode.accessibleOrder = [
      this.leftRatioHalf,
      this.rightRatioHalf,
      bothHandsInteractionNode,
      this.gridViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.accessibleOrder = [
      this.resetAllButton
    ];

    // static layout
    this.resetAllButton.right = this.gridViewRadioButtonGroup.right = this.layoutBounds.maxX - RatioAndProportionConstants.SCREEN_VIEW_X_MARGIN;
    this.resetAllButton.bottom = this.layoutBounds.height - RatioAndProportionConstants.SCREEN_VIEW_Y_MARGIN;
    this.gridViewRadioButtonGroup.top = this.layoutBounds.height * .15;

    // @private - dynamic layout based on the current ScreenView coordinates
    this.layoutRatioAndProportionScreeView = newRatioHalfBounds => {

      this.leftRatioHalf.layout( newRatioHalfBounds );
      this.rightRatioHalf.layout( newRatioHalfBounds );
      backgroundNode.rectBounds = this.visibleBoundsProperty.value;
      backgroundNode.bottom = this.layoutBounds.bottom;

      // subtract the top and bottom rectangles from the grid height
      labelsNode.layout( newRatioHalfBounds.height - ( 2 * RatioHalf.FRAMING_RECTANGLE_HEIGHT ) );

      const ratioWidth = this.leftRatioHalf.width + this.rightRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + labelsNode.width;

      // combo box is a proxy for the width of the controls
      this.leftRatioHalf.left = ( this.layoutBounds.width - CONTROL_PANEL_WIDTH - ratioWidth ) / 2;
      labelsNode.left = this.leftRatioHalf.right + RATIO_HALF_SPACING;
      this.rightRatioHalf.left = labelsNode.right + RATIO_HALF_SPACING;
      this.leftRatioHalf.bottom = this.rightRatioHalf.bottom = this.layoutBounds.bottom;

      labelsNode.bottom = this.layoutBounds.bottom - RatioHalf.FRAMING_RECTANGLE_HEIGHT + labelsNode.labelHeight / 2;
    };
    this.layoutRatioAndProportionScreeView( defaultRatioHalfBounds );
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
    this.layoutRatioAndProportionScreeView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, Math.min( height / scale, MAX_RATIO_HEIGHT ) ) );
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.gridViewProperty.reset();

    this.leftRatioHalf.reset();
    this.rightRatioHalf.reset();
    this.proportionFitnessSoundGenerator.reset();
  }

  /**
   * @override
   * @public
   * @param {number} dt
   */
  step( dt ) {

    // TODO: add support for mechamarker input, https://github.com/phetsims/ratio-and-proportion/issues/89
    // this.markerInput.step( dt );
    this.proportionFitnessSoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'RatioAndProportionScreenView', RatioAndProportionScreenView );
export default RatioAndProportionScreenView;