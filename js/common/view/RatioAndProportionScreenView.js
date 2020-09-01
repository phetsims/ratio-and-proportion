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
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import numberedTickMarkIconImage from '../../../images/numbered-tick-mark-icon_png.js';
import tickMarkIconImage from '../../../images/tick-mark-icon_png.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioAndProportionConstants from '../RatioAndProportionConstants.js';
import HandPositionsDescriber from './HandPositionsDescriber.js';
import RAPTickMarkLabelsNode from './RAPTickMarkLabelsNode.js';
import RatioAndProportionColorProfile from './RatioAndProportionColorProfile.js';
import RatioDescriber from './RatioDescriber.js';
import RatioHalf from './RatioHalf.js';
import RatioInteractionListener from './RatioInteractionListener.js';
import ProportionFitnessSoundGenerator from './sound/ProportionFitnessSoundGenerator.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import TickMarkView from './TickMarkView.js';

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

      // What is the unit value of the tick marks. Value reads as "1/x of the view height." This type is responsible for
      // resetting this on reset all.
      tickMarkRangeProperty: new NumberProperty( 10 )
    }, options );

    const tickMarksAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => Color.interpolateRGBA(
        RatioAndProportionColorProfile.tickMarksAndLabelsInFitnessProperty.value,
        RatioAndProportionColorProfile.tickMarksAndLabelsOutOfFitnessProperty.value, fitness
      ) );

    const tickMarkViewProperty = new EnumerationProperty( TickMarkView, TickMarkView.NONE, {
      tandem: tandem.createTandem( 'tickMarkViewProperty' )
    } );

    super( options );

    const tickMarkDescriber = new TickMarkDescriber( model.valueRange, options.tickMarkRangeProperty );

    // @protected (read-only)
    this.ratioDescriber = new RatioDescriber( model );
    this.handPositionsDescriber = new HandPositionsDescriber( model.leftValueProperty, model.rightValueProperty, model.valueRange, tickMarkDescriber );

    // @protected
    this.tickMarkViewProperty = tickMarkViewProperty;

    // by default, the keyboard step size should be half of one default tick mark width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    const keyboardStep = 1 / 2 / options.tickMarkRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ tickMarkViewProperty, options.tickMarkRangeProperty, model.targetRatioProperty ];

    const playUISoundsProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => fitness === model.fitnessRange.min || model.inProportion() );

    // @private {RatioHalf}
    this.leftRatioHalf = new RatioHalf(
      model.leftValueProperty,
      model.valueRange,
      model.enabledValueRangeProperty,
      model.firstInteractionProperty,
      defaultRatioHalfBounds,
      tickMarkViewProperty,
      options.tickMarkRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      tickMarksAndLabelsColorProperty,
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
      tickMarkViewProperty,
      options.tickMarkRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      tickMarksAndLabelsColorProperty,
      keyboardStep,
      model.lockRatioProperty,
      playUISoundsProperty, {
        accessibleName: ratioAndProportionStrings.a11y.rightHand,
        a11yDependencies: a11yDependencies,
        helpText: ratioAndProportionStrings.a11y.rightHandHelpText
      } );

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
      model.rightValueProperty, model.valueRange, model.firstInteractionProperty, options.tickMarkRangeProperty, keyboardStep );
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
        bothHandsPositionUtterance.alert = this.handPositionsDescriber.getBothHandsPositionText( tickMarkViewProperty.value );
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
    const labelsNode = new RAPTickMarkLabelsNode( tickMarkViewProperty, options.tickMarkRangeProperty, 1000, tickMarksAndLabelsColorProperty );

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
        options.tickMarkRangeProperty.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // @protected - subtype is responsible for layout
    this.tickMarkViewRadioButtonGroup = new RadioButtonGroup( tickMarkViewProperty, [ {
      node: new FontAwesomeNode( 'eye_close', { scale: 0.8 } ),
      value: TickMarkView.NONE,
      labelContent: ratioAndProportionStrings.a11y.tickMark.showNo
    }, {
      node: new Image( tickMarkIconImage, { scale: .2 } ),
      value: TickMarkView.HORIZONTAL,
      labelContent: ratioAndProportionStrings.a11y.tickMark.show
    }, {
      node: new Image( numberedTickMarkIconImage, { scale: .2 } ),
      value: TickMarkView.HORIZONTAL_UNITS,
      labelContent: ratioAndProportionStrings.a11y.tickMark.showNumbered
    } ], {
      orientation: 'horizontal',
      baseColor: 'white',
      labelContent: ratioAndProportionStrings.a11y.tickMark.heading,
      helpText: ratioAndProportionStrings.a11y.tickMark.helpText,
      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
      scale: 1.07 // calculated to try to match this width with other components in subtypes
    } );

    // children
    this.children = [
      backgroundNode,
      labelsNode,

      // UI
      this.tickMarkViewRadioButtonGroup,
      this.resetAllButton,

      // Main ratio on top
      bothHandsInteractionNode
    ];

    // accessible order (ratio first in nav order)
    this.pdomPlayAreaNode.accessibleOrder = [
      this.leftRatioHalf,
      this.rightRatioHalf,
      bothHandsInteractionNode,
      this.tickMarkViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.accessibleOrder = [
      this.resetAllButton
    ];

    // static layout
    this.resetAllButton.right = this.tickMarkViewRadioButtonGroup.right = this.layoutBounds.maxX - RatioAndProportionConstants.SCREEN_VIEW_X_MARGIN;
    this.resetAllButton.bottom = this.layoutBounds.height - RatioAndProportionConstants.SCREEN_VIEW_Y_MARGIN;
    this.tickMarkViewRadioButtonGroup.top = this.layoutBounds.height * .15;

    // @private - dynamic layout based on the current ScreenView coordinates
    this.layoutRatioAndProportionScreeView = newRatioHalfBounds => {

      this.leftRatioHalf.layout( newRatioHalfBounds );
      this.rightRatioHalf.layout( newRatioHalfBounds );
      backgroundNode.rectBounds = this.visibleBoundsProperty.value;
      backgroundNode.bottom = this.layoutBounds.bottom;

      // subtract the top and bottom rectangles from the tick marks height
      labelsNode.layout( newRatioHalfBounds.height - ( 2 * RatioHalf.FRAMING_RECTANGLE_HEIGHT ) );

      const ratioWidth = this.leftRatioHalf.width + this.rightRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + labelsNode.width;

      // combo box is a proxy for the width of the controls
      this.leftRatioHalf.left = ( this.layoutBounds.width - CONTROL_PANEL_WIDTH - ratioWidth ) / 2;
      labelsNode.left = this.leftRatioHalf.right + RATIO_HALF_SPACING;
      this.rightRatioHalf.left = labelsNode.right + RATIO_HALF_SPACING;

      this.leftRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );
      this.rightRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );

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
    this.tickMarkViewProperty.reset();

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