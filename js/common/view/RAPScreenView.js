// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioTerm from '../model/RatioTerm.js';
import RAPConstants from '../RAPConstants.js';
import BothHandsPDOMNode from './BothHandsPDOMNode.js';
import CueDisplay from './CueDisplay.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import HandPositionsDescriber from './describers/HandPositionsDescriber.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkDescriber from './describers/TickMarkDescriber.js';
import RAPColorProfile from './RAPColorProfile.js';
import RAPTickMarkLabelsNode from './RAPTickMarkLabelsNode.js';
import RatioHalf from './RatioHalf.js';
import InProportionSoundGenerator from './sound/InProportionSoundGenerator.js';
import MovingInProportionSoundGenerator from './sound/MovingInProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './sound/StaccatoFrequencySoundGenerator.js';
import ViewSounds from './sound/ViewSounds.js';
import TickMarkView from './TickMarkView.js';
import TickMarkViewRadioButtonGroup from './TickMarkViewRadioButtonGroup.js';

// constants
const LAYOUT_BOUNDS = ScreenView.DEFAULT_LAYOUT_BOUNDS;
const MAX_RATIO_HEIGHT = LAYOUT_BOUNDS.width * 2; // relatively arbitrary, but good to set a max so it can't get too skinny
const ONE_QUARTER_LAYOUT_WIDTH = LAYOUT_BOUNDS.width * .25;
const RATIO_HALF_WIDTH = ONE_QUARTER_LAYOUT_WIDTH;
const RATIO_HALF_SPACING = 10;

const uiScaleFunction = new LinearFunction( LAYOUT_BOUNDS.height, MAX_RATIO_HEIGHT, 1, 1.5, true );
const uiPositionFunction = new LinearFunction( 1, 1.5, LAYOUT_BOUNDS.height * .15, -LAYOUT_BOUNDS.height * .2, true );

const DEFAULT_RANGE = RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE;

class RAPScreenView extends ScreenView {

  /**
   * @param {RAPModel} model
   * @param {Tandem} tandem
   * @param options
   */
  constructor( model, tandem, options ) {

    options = merge( {
      tandem: tandem,
      layoutBounds: LAYOUT_BOUNDS,

      // What is the unit value of the tick marks. Value reads as "1/x of the view height." This type is responsible for
      // resetting this on reset all.
      tickMarkRangeProperty: new NumberProperty( 10 ),

      // Properties that control the color of each hand
      leftHandColorProperty: new Property( 'black' ),
      rightHandColorProperty: new Property( 'black' )
    }, options );

    const tickMarksAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => Color.interpolateRGBA(
        RAPColorProfile.tickMarksAndLabelsOutOfFitnessProperty.value,
        RAPColorProfile.tickMarksAndLabelsInFitnessProperty.value, fitness
      ) );

    super( options );

    const tickMarkViewProperty = new EnumerationProperty( TickMarkView, TickMarkView.NONE, {
      tandem: tandem.createTandem( 'tickMarkViewProperty' )
    } );

    const antecedentCueDisplayProperty = new EnumerationProperty( CueDisplay, CueDisplay.ARROWS );
    const consequentCueDisplayProperty = new EnumerationProperty( CueDisplay, CueDisplay.ARROWS );

    // for ease at usage sites
    const ratio = model.ratio;

    const tickMarkDescriber = new TickMarkDescriber( DEFAULT_RANGE, options.tickMarkRangeProperty, tickMarkViewProperty );

    // @protected (read-only)
    this.ratioDescriber = new RatioDescriber( model );
    this.handPositionsDescriber = new HandPositionsDescriber( ratio.antecedentProperty, ratio.consequentProperty, DEFAULT_RANGE, tickMarkDescriber );
    const bothHandsDescriber = new BothHandsDescriber( ratio.antecedentProperty, ratio.consequentProperty, tickMarkViewProperty,
      this.ratioDescriber, this.handPositionsDescriber );

    // @protected
    this.tickMarkViewProperty = tickMarkViewProperty;

    // @private - SoundGenerators that sonify different aspects of the model
    this.inProportionSoundGenerator = new InProportionSoundGenerator( model, () => model.ratio.currentRatio );
    this.movingInProportionSoundGenerator = new MovingInProportionSoundGenerator( model );
    this.staccatoFrequencySoundGenerator = new StaccatoFrequencySoundGenerator( model.ratioFitnessProperty, model.fitnessRange,
      model.inProportion.bind( model ) );

    soundManager.addSoundGenerator( this.staccatoFrequencySoundGenerator );
    soundManager.addSoundGenerator( this.inProportionSoundGenerator );
    soundManager.addSoundGenerator( this.movingInProportionSoundGenerator );

    // Tick mark sounds get played when ratio isn't locked, and when staccato sounds aren't playing
    const playTickMarkBumpSoundProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      fitness => !model.ratio.lockedProperty.value && fitness === model.fitnessRange.min );

    // @private
    this.viewSounds = new ViewSounds( RAPConstants.TOTAL_RATIO_COMPONENT_VALUE_RANGE, options.tickMarkRangeProperty,
      options.tickMarkRangeProperty, playTickMarkBumpSoundProperty );

    // by default, the keyboard step size should be half of one default tick mark width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    const keyboardStep = 1 / 2 / options.tickMarkRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ tickMarkViewProperty, options.tickMarkRangeProperty, model.targetRatioProperty ];

    // @private {RatioHalf}
    this.antecedentRatioHalf = new RatioHalf(
      ratio.antecedentProperty,
      DEFAULT_RANGE,
      model.ratio.enabledRatioTermsRangeProperty,
      antecedentCueDisplayProperty,
      defaultRatioHalfBounds,
      tickMarkViewProperty,
      options.tickMarkRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      bothHandsDescriber,
      tickMarksAndLabelsColorProperty,
      keyboardStep,
      model.ratio.lockedProperty,
      model.ratio.lockedProperty, // not a bug
      this.viewSounds,
      this.inProportionSoundGenerator, () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT ), {
        handColorProperty: options.leftHandColorProperty,
        accessibleName: ratioAndProportionStrings.a11y.leftHand,
        a11yDependencies: a11yDependencies,
        isRight: false // this way we get a left hand
      }
    );

    // @private {RatioHalf}
    this.consequentRatioHalf = new RatioHalf(
      ratio.consequentProperty,
      DEFAULT_RANGE,
      model.ratio.enabledRatioTermsRangeProperty,
      consequentCueDisplayProperty,
      defaultRatioHalfBounds,
      tickMarkViewProperty,
      options.tickMarkRangeProperty,
      this.ratioDescriber,
      this.handPositionsDescriber,
      bothHandsDescriber,
      tickMarksAndLabelsColorProperty,
      keyboardStep,
      model.ratio.lockedProperty,
      model.ratio.lockedProperty, // not a bug
      this.viewSounds,
      this.inProportionSoundGenerator, () => model.getIdealValueForTerm( RatioTerm.CONSEQUENT ), {
        handColorProperty: options.rightHandColorProperty,
        accessibleName: ratioAndProportionStrings.a11y.rightHand,
        a11yDependencies: a11yDependencies,
        helpText: ratioAndProportionStrings.a11y.rightHandHelpText
      } );

    const bothHandsPDOMNode = new BothHandsPDOMNode( ratio.ratioTupleProperty, DEFAULT_RANGE,
      antecedentCueDisplayProperty, consequentCueDisplayProperty, keyboardStep, tickMarkViewProperty, options.tickMarkRangeProperty, model.unclampedFitnessProperty,
      this.handPositionsDescriber, this.ratioDescriber, bothHandsDescriber, this.viewSounds, model.ratio.lockedProperty,
      model.targetRatioProperty, model.getIdealValueForTerm.bind( model ), {
        interactiveNodeOptions: {
          children: [ this.antecedentRatioHalf, this.consequentRatioHalf ]
        }
      } );

    // @private TODO: add support for mechamarker input again https://github.com/phetsims/ratio-and-proportion/issues/89
    // this.markerInput = new ProportionMarkerInput( ratio.antecedentProperty, ratio.consequentProperty );

    const soundGeneratorEnabledProperty = DerivedProperty.or( [
      this.antecedentRatioHalf.isBeingInteractedWithProperty,
      this.consequentRatioHalf.isBeingInteractedWithProperty,
      // this.markerInput.isBeingInteractedWithProperty, // TODO: add support for mechamarker input again https://github.com/phetsims/ratio-and-proportion/issues/89
      bothHandsPDOMNode.isBeingInteractedWithProperty
    ] );

    this.inProportionSoundGenerator.addEnableControlProperty( soundGeneratorEnabledProperty );
    this.movingInProportionSoundGenerator.addEnableControlProperty( soundGeneratorEnabledProperty );
    this.staccatoFrequencySoundGenerator.addEnableControlProperty( soundGeneratorEnabledProperty );

    // these dimensions are just temporary, and will be recomputed below in the layout function
    const labelsNode = new RAPTickMarkLabelsNode( tickMarkViewProperty, options.tickMarkRangeProperty, 1000, tickMarksAndLabelsColorProperty );

    const backgroundNode = Rectangle.bounds( this.layoutBounds, {
      fill: 'black'
    } );

    model.ratioFitnessProperty.link( fitness => {
      let color = null;
      if ( model.inProportion() ) {
        color = RAPColorProfile.backgroundInFitnessProperty.value;
      }
      else {
        color = Color.interpolateRGBA(
          RAPColorProfile.backgroundOutOfFitnessProperty.value,
          RAPColorProfile.backgroundInterpolationToFitnessProperty.value,
          ( fitness - model.fitnessRange.min ) / ( 1 - model.getInProportionThreshold() )
        );
      }
      backgroundNode.setFill( color );
    } );

    // @protected - Keep a separate layer for "Control panel" like UI on the right. This allows them to be scaled
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
        options.tickMarkRangeProperty.reset();
        antecedentCueDisplayProperty.reset();
        consequentCueDisplayProperty.reset();
        bothHandsPDOMNode.reset();

        this.tickMarkViewProperty.reset();
        this.antecedentRatioHalf.reset();
        this.consequentRatioHalf.reset();
        this.staccatoFrequencySoundGenerator.reset();
        this.inProportionSoundGenerator.reset();
        this.movingInProportionSoundGenerator.reset();
        this.viewSounds.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // @protected - subtype is responsible for layout
    this.tickMarkViewRadioButtonGroup = new TickMarkViewRadioButtonGroup( tickMarkViewProperty );

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
    this.pdomPlayAreaNode.accessibleOrder = [
      this.antecedentRatioHalf,
      this.consequentRatioHalf,
      bothHandsPDOMNode,
      this.tickMarkViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.accessibleOrder = [
      this.resetAllButton
    ];

    // @private - dynamic layout based on the current ScreenView coordinates
    this.layoutRAPScreeView = newRatioHalfBounds => {

      // between 0 and 1, 0 is the min height, 1 is the max height
      const heightScalar = ( newRatioHalfBounds.height - LAYOUT_BOUNDS.height ) / ( MAX_RATIO_HEIGHT - LAYOUT_BOUNDS.height );

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
      this.topScalingUILayerNode.right = this.bottomScalingUILayerNode.right = this.layoutBounds.maxX - RAPConstants.SCREEN_VIEW_X_MARGIN;
      this.bottomScalingUILayerNode.bottom = this.layoutBounds.height - RAPConstants.SCREEN_VIEW_Y_MARGIN;

      // combo box is a proxy for the width of the controls
      this.antecedentRatioHalf.left = ( this.topScalingUILayerNode.left - ratioWidth ) / 2;
      labelsNode.left = this.antecedentRatioHalf.right + RATIO_HALF_SPACING;
      this.consequentRatioHalf.left = labelsNode.right + RATIO_HALF_SPACING;

      this.antecedentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );
      this.consequentRatioHalf.setBottomOfRatioHalf( this.layoutBounds.bottom );

      labelsNode.bottom = this.layoutBounds.bottom - this.antecedentRatioHalf.framingRectangleHeight + labelsNode.labelHeight / 2;
    };
    this.layoutRAPScreeView( defaultRatioHalfBounds );
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
    this.layoutRAPScreeView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, Math.min( height / scale, MAX_RATIO_HEIGHT ) ) );
  }

  /**
   * @override
   * @public
   * @param {number} dt
   */
  step( dt ) {

    // TODO: add support for mechamarker input, https://github.com/phetsims/ratio-and-proportion/issues/89
    // this.markerInput.step( dt );
    this.inProportionSoundGenerator.step( dt );
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'RAPScreenView', RAPScreenView );
export default RAPScreenView;