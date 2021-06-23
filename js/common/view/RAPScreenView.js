// Copyright 2020-2021, University of Colorado Boulder

/**
 * Base class ScreenView which creates view components that all screens use. This includes the central ratio "scene" which
 * has two RatioHalf instances and supports showing tick marks and their labels. There is a RadioButtonGroup to control
 * the tick mark view too. Subtypes are responsible for creating a control for changing the model's targetRatioProperty.
 *
 * This type creates its own layout function, because the ratio interaction is inherently quite vertical. This type
 * maximizes the vertical space of a layout and extends the ratio to a vertical aspect ratio when possible. It also
 * supports scaling up UI controls (on the right) to match the aspect ratio. See this.topScalingUILayerNode and
 * this.bottomScalingUILayerNode for more details.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import BothHandsPDOMNode from './BothHandsPDOMNode.js';
import CueArrowsState from './CueArrowsState.js';
import CueDisplay from './CueDisplay.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import HandPositionsDescriber from './describers/HandPositionsDescriber.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkDescriber from './describers/TickMarkDescriber.js';
import RAPColorProfile from './RAPColorProfile.js';
import RAPMarkerInput from './RAPMarkerInput.js';
import RAPTickMarkLabelsNode from './RAPTickMarkLabelsNode.js';
import RatioHalf from './RatioHalf.js';
import InProportionSoundGenerator from './sound/InProportionSoundGenerator.js';
import MovingInProportionSoundGenerator from './sound/MovingInProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './sound/StaccatoFrequencySoundGenerator.js';
import TickMarkView from './TickMarkView.js';
import TickMarkViewRadioButtonGroup from './TickMarkViewRadioButtonGroup.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MAX_RATIO_HEIGHT = LAYOUT_BOUNDS.width * 2; // relatively arbitrary, but good to set a max so it can't get too skinny
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * 0.25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;
const RATIO_HALF_SPACING = 10;

// Percentage of the layout bounds width that is taken up by the ratio (including margins) rather than the control
// area on the right.
const RATIO_SECTION_WIDTH = 2 / 3;

const uiScaleFunction = new LinearFunction( LAYOUT_BOUNDS.height, MAX_RATIO_HEIGHT, 1, 1.5, true );
const uiPositionFunction = new LinearFunction( 1, 1.5, LAYOUT_BOUNDS.height * 0.15, -LAYOUT_BOUNDS.height * 0.2, true );

class RAPScreenView extends ScreenView {

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    options = merge( {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS,

      // Properties that control the color of each hand
      leftHandColorProperty: new Property( 'black' ),
      rightHandColorProperty: new Property( 'black' ),

      // Passed through to BothHandsPDOMNode
      bothHandsPDOMNodeOptions: null
    }, options );

    super( options );

    // for ease at usage sites
    const ratio = model.ratio;

    // @protected
    this.tickMarkViewProperty = new EnumerationProperty( TickMarkView, TickMarkView.NONE, {
      tandem: tandem.createTandem( 'tickMarkViewProperty' )
    } );

    // @protected - What is the unit value of the tick marks. Value reads as "1/x of the view height."
    this.tickMarkRangeProperty = new NumberProperty( 10, { tandem: tandem.createTandem( 'tickMarkRangeProperty' ) } );

    const tickMarkDescriber = new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty );

    // @protected (read-only)
    this.ratioDescriber = new RatioDescriber( model );
    this.handPositionsDescriber = new HandPositionsDescriber( ratio.tupleProperty, tickMarkDescriber );
    const bothHandsDescriber = new BothHandsDescriber(
      ratio.tupleProperty,
      ratio.enabledRatioTermsRangeProperty,
      ratio.lockedProperty,
      this.tickMarkViewProperty,
      this.ratioDescriber,
      this.handPositionsDescriber
    );

    // A collection of properties that keep track of which cues should be displayed for both the antecedent and consequent hands.
    const cueArrowsState = new CueArrowsState();

    const tickMarksAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => Color.interpolateRGBA(
        RAPColorProfile.tickMarksAndLabelsOutOfFitnessProperty.value,
        RAPColorProfile.tickMarksAndLabelsInFitnessProperty.value, fitness
      ) );

    // Tick mark sounds get played when ratio isn't locked, and when staccato sounds aren't playing
    const playTickMarkBumpSoundProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => !model.ratio.lockedProperty.value && fitness === rapConstants.RATIO_FITNESS_RANGE.min );

    // by default, the keyboard step size should be half of one default tick mark width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    // NOTE: do not change this without changing the copied constant in getKeyboardInputSnappingMapperTests.js
    const keyboardStep = 1 / 2 / this.tickMarkRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ model.unclampedFitnessProperty, this.tickMarkViewProperty, this.tickMarkRangeProperty, model.targetRatioProperty ];


    // @private {RatioHalf}
    this.antecedentRatioHalf = new RatioHalf( {

      // config
      ratioTerm: RatioTerm.ANTECEDENT,
      ratioTupleProperty: ratio.tupleProperty,
      enabledRatioTermsRangeProperty: model.ratio.enabledRatioTermsRangeProperty,
      displayBothHandsCueProperty: cueArrowsState.bothHands.antecedentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      handPositionsDescriber: this.handPositionsDescriber,
      bothHandsDescriber: bothHandsDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      ratioLockedProperty: model.ratio.lockedProperty, // not a bug
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: isJumping => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),
      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT ),
      inProportionProperty: model.inProportionProperty,

      // optional
      handColorProperty: options.leftHandColorProperty,
      accessibleName: ratioAndProportionStrings.a11y.leftHand,
      a11yDependencies: a11yDependencies,
      bothHandsCueDisplay: CueDisplay.W_S,
      isRight: false, // this way we get a left hand

      // Added to the antecedent for ease, but it applies to both RatioHalfs in the PDOM
      helpText: ratioAndProportionStrings.a11y.individualHandsHelpText,
      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,

      // phet-io
      tandem: tandem.createTandem( 'antecedentRatioHalf' )
    } );

    // @private {RatioHalf}
    this.consequentRatioHalf = new RatioHalf( {

      // required
      ratioTerm: RatioTerm.CONSEQUENT,
      ratioTupleProperty: ratio.tupleProperty,
      enabledRatioTermsRangeProperty: model.ratio.enabledRatioTermsRangeProperty,
      displayBothHandsCueProperty: cueArrowsState.bothHands.consequentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      handPositionsDescriber: this.handPositionsDescriber,
      bothHandsDescriber: bothHandsDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      ratioLockedProperty: model.ratio.lockedProperty, // not a bug
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: isJumping => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),
      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.CONSEQUENT ),
      inProportionProperty: model.inProportionProperty,

      // optional
      handColorProperty: options.rightHandColorProperty,
      accessibleName: ratioAndProportionStrings.a11y.rightHand,
      a11yDependencies: a11yDependencies,

      // phet-io
      tandem: tandem.createTandem( 'consequentRatioHalf' )
    } );

    const bothHandsPDOMNode = new BothHandsPDOMNode( merge( {
        ratioTupleProperty: ratio.tupleProperty,
        enabledRatioTermsRangeProperty: ratio.enabledRatioTermsRangeProperty,
        cueArrowsState: cueArrowsState,
        keyboardStep: keyboardStep,
        tickMarkViewProperty: this.tickMarkViewProperty,
        tickMarkRangeProperty: this.tickMarkRangeProperty,
        unclampedFitnessProperty: model.unclampedFitnessProperty,
        ratioDescriber: this.ratioDescriber,
        bothHandsDescriber: bothHandsDescriber,
        playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,
        ratioLockedProperty: model.ratio.lockedProperty,
        targetRatioProperty: model.targetRatioProperty,
        getIdealTerm: model.getIdealValueForTerm.bind( model ),
        inProportionProperty: model.inProportionProperty,

        interactiveNodeOptions: {
          children: [ this.antecedentRatioHalf, this.consequentRatioHalf ]
        }
      }, options.bothHandsPDOMNodeOptions )
    );

    if ( RAPQueryParameters.tangible ) {

      // @private
      this.markerInput = new RAPMarkerInput( ratio.tupleProperty );

      this.markerInput.isBeingInteractedWithProperty.lazyLink( interactedWithMarkers => {
        if ( interactedWithMarkers ) {
          cueArrowsState.interactedWithMouseProperty.value = true;
        }
      } );
    }

    const soundGeneratorEnabledProperty = DerivedProperty.or( [
      this.antecedentRatioHalf.isBeingInteractedWithProperty,
      this.consequentRatioHalf.isBeingInteractedWithProperty,
      bothHandsPDOMNode.isBeingInteractedWithProperty,
      this.markerInput ? this.markerInput.isBeingInteractedWithProperty : new BooleanProperty( false )
    ] );


    // @private - SoundGenerators that sonify different aspects of the model
    this.inProportionSoundGenerator = new InProportionSoundGenerator( model, soundGeneratorEnabledProperty );
    this.movingInProportionSoundGenerator = new MovingInProportionSoundGenerator( model, {
      enableControlProperties: [ soundGeneratorEnabledProperty ]
    } );
    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( model.ratioFitnessProperty, rapConstants.RATIO_FITNESS_RANGE,
      model.inProportionProperty, {
        enableControlProperties: [ soundGeneratorEnabledProperty ]
      } );

    soundManager.addSoundGenerator( this.staccatoFrequencySoundGenerator );
    soundManager.addSoundGenerator( this.inProportionSoundGenerator );
    soundManager.addSoundGenerator( this.movingInProportionSoundGenerator );

    // these dimensions are just temporary, and will be recomputed below in the layout function
    const labelsNode = new RAPTickMarkLabelsNode( this.tickMarkViewProperty, this.tickMarkRangeProperty, 1000, tickMarksAndLabelsColorProperty );

    const backgroundNode = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );

    // adjust the background color based on the current ratio fitness
    Property.multilink( [
      model.ratioFitnessProperty,
      model.inProportionProperty
    ], ( fitness, inProportion ) => {
      let color = null;
      if ( inProportion ) {
        color = RAPColorProfile.backgroundInFitnessProperty.value;
      }
      else {
        const interpolatedDistance = ( fitness - rapConstants.RATIO_FITNESS_RANGE.min ) / ( 1 - model.getInProportionThreshold() );
        color = Color.interpolateRGBA(
          RAPColorProfile.backgroundOutOfFitnessProperty.value,
          RAPColorProfile.backgroundInterpolationToFitnessProperty.value,
          Utils.clamp( interpolatedDistance, 0, 1 )
        );
      }
      backgroundNode.setFill( color );
    } );

    // @protected - Keep a separate layer for "control-panel-esque"  UI on the right. This allows them to be scaled
    // to maximize their size within the horizontal space in vertical aspect ratios, see https://github.com/phetsims/ratio-and-proportion/issues/79
    // These are two separate containers so that scaling them can take away space in between them while keeping each
    // positioned based on the corners of the layout.
    this.topScalingUILayerNode = new Node();
    this.bottomScalingUILayerNode = new Node();

    // @protected - used only for subtype layout
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        cueArrowsState.reset();
        bothHandsPDOMNode.reset();
        bothHandsDescriber.reset();
        this.markerInput && this.markerInput.reset();
        this.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // @protected - subtype is responsible for layout
    this.tickMarkViewRadioButtonGroup = new TickMarkViewRadioButtonGroup( this.tickMarkViewProperty, {
      tandem: tandem.createTandem( 'tickMarkViewRadioButtonGroup' )
    } );

    // add this Node to the layer that is scaled up to support vertical aspect ratios
    this.topScalingUILayerNode.addChild( this.tickMarkViewRadioButtonGroup );
    this.bottomScalingUILayerNode.addChild( this.resetAllButton );

    // children
    this.children = [
      backgroundNode,
      labelsNode,

      // UI
      this.topScalingUILayerNode,
      this.bottomScalingUILayerNode,

      // Main ratio on top
      bothHandsPDOMNode
    ];

    // accessible order (ratio first in nav order)
    this.pdomPlayAreaNode.pdomOrder = [
      bothHandsPDOMNode,
      this.tickMarkViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.pdomOrder = [
      this.resetAllButton
    ];

    // @private - dynamic layout based on the current ScreenView coordinates
    this.layoutRAPScreeView = newRatioHalfBounds => {

      // between 0 and 1, 0 is the min height, 1 is the max height
      const heightScalar = Utils.clamp( ( newRatioHalfBounds.height - LAYOUT_BOUNDS.height ) / ( MAX_RATIO_HEIGHT - LAYOUT_BOUNDS.height ), 0, 1 );

      this.antecedentRatioHalf.layout( newRatioHalfBounds, heightScalar );
      this.consequentRatioHalf.layout( newRatioHalfBounds, heightScalar );
      backgroundNode.rectBounds = this.visibleBoundsProperty.value;
      backgroundNode.bottom = this.layoutBounds.bottom;

      // subtract the top and bottom rectangles from the tick marks height
      labelsNode.layout( newRatioHalfBounds.height - ( 2 * this.antecedentRatioHalf.framingRectangleHeight ) );

      const ratioWidth = this.antecedentRatioHalf.width + this.consequentRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + labelsNode.width;

      const uiLayerScale = uiScaleFunction( newRatioHalfBounds.height );
      this.topScalingUILayerNode.setScaleMagnitude( uiLayerScale );
      this.bottomScalingUILayerNode.setScaleMagnitude( uiLayerScale );
      this.topScalingUILayerNode.top = uiPositionFunction( uiLayerScale );

      // do this again each time after scaling
      this.topScalingUILayerNode.right = this.bottomScalingUILayerNode.right = this.layoutBounds.maxX - rapConstants.SCREEN_VIEW_X_MARGIN;
      this.bottomScalingUILayerNode.bottom = this.layoutBounds.height - rapConstants.SCREEN_VIEW_Y_MARGIN;

      assert && assert( Math.min( this.topScalingUILayerNode.left, this.bottomScalingUILayerNode.left ) >
                        ratioWidth - rapConstants.SCREEN_VIEW_X_MARGIN,
        'ratio width has to fit' );

      // topScalingUILayerNode is a proxy for the width of the controls to the right of the ratio
      this.antecedentRatioHalf.left = ( Math.max( RATIO_SECTION_WIDTH * this.layoutBounds.width, ratioWidth ) - ratioWidth ) / 2;

      labelsNode.left = this.antecedentRatioHalf.right + RATIO_HALF_SPACING;
      this.consequentRatioHalf.left = labelsNode.right + RATIO_HALF_SPACING;

      this.antecedentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );
      this.consequentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );

      // offset the bottom so that the center of the text is right on the tick mark
      labelsNode.bottom = this.layoutBounds.bottom - this.antecedentRatioHalf.framingRectangleHeight + labelsNode.labelHeight / 2;

      assert && assert( this.antecedentRatioHalf.width + this.consequentRatioHalf.width +
                        Math.max( this.topScalingUILayerNode.width, this.bottomScalingUILayerNode.width ) < LAYOUT_BOUNDS.width,
        'everything should fit inside layout bounds' );
    };
    this.layoutRAPScreeView( defaultRatioHalfBounds );
  }

  /**
   * Layout Nodes part of ethe screen viw. To accomplish, much of this was copied from ScreenView.layout, with
   * minor tweaks for this specific case. Also note Projectile Motion uses almost the exact same algorithm.
   *
   * @param {Bounds2} viewBounds
   * @override
   * @public
   */
  layout( viewBounds ) {
    this.resetTransform();

    const scale = this.getLayoutScale( viewBounds );
    const width = viewBounds.width;
    const height = viewBounds.height;
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
    this.translate( dx + viewBounds.left / scale, dy + viewBounds.top / scale );

    // set visible bounds, which are different from layout bounds
    this.visibleBoundsProperty.set( new Bounds2( -dx, -dy, width / scale - dx, height / scale - dy ) );

    // new bounds for each ratio half
    this.layoutRAPScreeView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, Math.min( height / scale, MAX_RATIO_HEIGHT ) ) );
  }

  /**
   * @public
   */
  reset() {
    this.tickMarkRangeProperty.reset();
    this.tickMarkViewProperty.reset();
    this.antecedentRatioHalf.reset();
    this.consequentRatioHalf.reset();
    this.staccatoFrequencySoundGenerator.reset();
    this.inProportionSoundGenerator.reset();
    this.movingInProportionSoundGenerator.reset();
  }

  /**
   * @override
   * @public
   * @param {number} dt
   */
  step( dt ) {

    this.markerInput && this.markerInput.step( dt );
    this.inProportionSoundGenerator.step( dt );
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'RAPScreenView', RAPScreenView );
export default RAPScreenView;