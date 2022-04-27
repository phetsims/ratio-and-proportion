// Copyright 2020-2022, University of Colorado Boulder

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
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Color, Node, ParallelDOM, Voicing } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import BothHandsPDOMNode, { BothHandsPDOMNodeOptions } from './BothHandsPDOMNode.js';
import CueArrowsState from './CueArrowsState.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkDescriber from './describers/TickMarkDescriber.js';
import RAPColors from './RAPColors.js';
import RAPMarkerInput from './RAPMarkerInput.js';
import RAPTickMarkLabelsNode from './RAPTickMarkLabelsNode.js';
import RatioHalf from './RatioHalf.js';
import InProportionSoundGenerator from './sound/InProportionSoundGenerator.js';
import MovingInProportionSoundGenerator from './sound/MovingInProportionSoundGenerator.js';
import StaccatoFrequencySoundGenerator from './sound/StaccatoFrequencySoundGenerator.js';
import TickMarkView from './TickMarkView.js';
import TickMarkViewRadioButtonGroup from './TickMarkViewRadioButtonGroup.js';
import RAPModel from '../model/RAPModel.js';
import CueDisplay from './CueDisplay.js';
import RAPPositionRegionsLayer from './RAPPositionRegionsLayer.js';
import BackgroundColorHandler from './BackgroundColorHandler.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import RAPMediaPipe from './RAPMediaPipe.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import RatioInputModality from './describers/RatioInputModality.js';

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

type SelfOptions = {
  leftHandColorProperty?: IReadOnlyProperty<Color>;
  rightHandColorProperty?: IReadOnlyProperty<Color>;
  bothHandsPDOMNodeOptions?: Partial<BothHandsPDOMNodeOptions>; // Because all the required pieces are added by this type
}

type RAPScreenViewOptions = SelfOptions & ScreenViewOptions;

class RAPScreenView extends ScreenView {

  protected tickMarkViewProperty: EnumerationProperty<TickMarkView>;

  // What is the unit value of the tick marks. Value reads as "1/x of the view height."
  protected tickMarkRangeProperty: NumberProperty;
  protected readonly ratioDescriber: RatioDescriber;
  private backgroundColorHandler: BackgroundColorHandler;
  private antecedentRatioHalf: RatioHalf;
  private consequentRatioHalf: RatioHalf;
  private markerInput: RAPMarkerInput | null;

  // SoundGenerators that sonify different aspects of the model
  private inProportionSoundGenerator: InProportionSoundGenerator;
  private movingInProportionSoundGenerator: MovingInProportionSoundGenerator;
  private staccatoFrequencySoundGenerator: StaccatoFrequencySoundGenerator;

  // Keep a separate layer for "control-panel-esque"  UI on the right. This allows them to be scaled
  // to maximize their size within the horizontal space in vertical aspect ratios, see https://github.com/phetsims/ratio-and-proportion/issues/79
  // These are two separate containers so that scaling them can take away space in between them while keeping each
  // positioned based on the corners of the layout.
  protected topScalingUILayerNode: Node;
  protected bottomScalingUILayerNode: Node;

  // used only for subtype layout
  protected resetAllButton: ResetAllButton;

  // subtype is responsible for layout
  protected tickMarkViewRadioButtonGroup: TickMarkViewRadioButtonGroup;

  private layoutRAPScreeView: ( currentScreenViewCoordinates: Bounds2 ) => void;
  private mediaPipe: RAPMediaPipe | null;

  constructor( model: RAPModel, backgroundColorProperty: Property<Color>, providedOptions?: RAPScreenViewOptions ) {

    const options = optionize<RAPScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      layoutBounds: LAYOUT_BOUNDS,

      // Properties that control the color of each hand
      leftHandColorProperty: new Property( Color.BLACK ),
      rightHandColorProperty: new Property( Color.BLACK ),

      // Passed through to BothHandsPDOMNode
      bothHandsPDOMNodeOptions: {}
    }, providedOptions );

    super( options );

    // for ease at usage sites
    const ratio = model.ratio;

    this.tickMarkViewProperty = new EnumerationProperty( TickMarkView.NONE, {
      tandem: options.tandem.createTandem( 'tickMarkViewProperty' )
    } );

    this.tickMarkRangeProperty = new NumberProperty( 10, { tandem: options.tandem.createTandem( 'tickMarkRangeProperty' ) } );


    this.backgroundColorHandler = new BackgroundColorHandler( model, backgroundColorProperty );

    this.ratioDescriber = new RatioDescriber( model );

    // A collection of properties that keep track of which cues should be displayed for both the antecedent and consequent hands.
    const cueArrowsState = new CueArrowsState();

    const tickMarksAndLabelsColorProperty = new DerivedProperty( [ model.ratioFitnessProperty ],
      ( fitness: number ) => Color.interpolateRGBA(
        RAPColors.tickMarksAndLabelsOutOfFitnessProperty.value,
        RAPColors.tickMarksAndLabelsInFitnessProperty.value, fitness
      ) );

    // Tick mark sounds get played when ratio isn't locked, and when staccato sounds aren't playing
    const playTickMarkBumpSoundProperty: Property<boolean> = new DerivedProperty( [ model.ratioFitnessProperty ],
      ( fitness: number ) => !model.ratio.lockedProperty.value && fitness === rapConstants.RATIO_FITNESS_RANGE.min );

    // by default, the keyboard step size should be half of one default tick mark width. See https://github.com/phetsims/ratio-and-proportion/issues/85
    // NOTE: do not change this without changing the copied constant in getKeyboardInputSnappingMapperTests.js
    const keyboardStep = 1 / 2 / this.tickMarkRangeProperty.value;

    const defaultRatioHalfBounds = Bounds2.rect( 0, 0, RATIO_HALF_WIDTH, LAYOUT_BOUNDS.height );

    // description on each ratioHalf should be updated whenever these change
    const a11yDependencies = [ model.unclampedFitnessProperty, this.tickMarkViewProperty, this.tickMarkRangeProperty, model.targetRatioProperty ];

    this.antecedentRatioHalf = new RatioHalf( {

      ratio: ratio,
      ratioTerm: RatioTerm.ANTECEDENT,
      displayBothHandsCueProperty: cueArrowsState.bothHands.antecedentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: ( isJumping: boolean ) => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),

      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.ANTECEDENT ),
      inProportionProperty: model.inProportionProperty,

      handColorProperty: options.leftHandColorProperty,
      accessibleName: ratioAndProportionStrings.a11y.leftHand,
      a11yDependencies: a11yDependencies,
      bothHandsCueDisplay: CueDisplay.W_S,
      isRight: false, // this way we get a left hand

      // Added to the antecedent for ease, but it applies to both RatioHalfs in the PDOM
      helpText: ratioAndProportionStrings.a11y.individualHandsHelpText,

      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,

      // phet-io
      tandem: options.tandem.createTandem( 'antecedentRatioHalf' )
    } );

    // @private {RatioHalf}
    this.consequentRatioHalf = new RatioHalf( {

      ratio: ratio,
      ratioTerm: RatioTerm.CONSEQUENT,
      displayBothHandsCueProperty: cueArrowsState.bothHands.consequentCueDisplayedProperty,
      cueArrowsState: cueArrowsState,
      bounds: defaultRatioHalfBounds,
      tickMarkViewProperty: this.tickMarkViewProperty,
      tickMarkRangeProperty: this.tickMarkRangeProperty,
      ratioDescriber: this.ratioDescriber,
      colorProperty: tickMarksAndLabelsColorProperty,
      keyboardStep: keyboardStep,
      horizontalMovementAllowedProperty: model.ratio.lockedProperty,
      playTickMarkBumpSoundProperty: playTickMarkBumpSoundProperty,

      // Make this a closure so support creation order
      setJumpingOverProportionShouldTriggerSound: ( isJumping: boolean ) => this.inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( isJumping ),

      getIdealValue: () => model.getIdealValueForTerm( RatioTerm.CONSEQUENT ),
      inProportionProperty: model.inProportionProperty,

      handColorProperty: options.rightHandColorProperty,
      accessibleName: ratioAndProportionStrings.a11y.rightHand,
      a11yDependencies: a11yDependencies,

      // phet-io
      tandem: options.tandem.createTandem( 'consequentRatioHalf' )
    } );

    // TODO: how to handle this merge? It seems like PHET_CORE/merge is the best case for this, we are &ing the two arguments into BothHandsPDOMNode, https://github.com/phetsims/chipper/issues/1128
    const bothHandsPDOMNode = new BothHandsPDOMNode( merge( {
        ratioTupleProperty: ratio.tupleProperty,
        enabledRatioTermsRangeProperty: ratio.enabledRatioTermsRangeProperty,
        cueArrowsState: cueArrowsState,
        keyboardStep: keyboardStep,
        tickMarkViewProperty: this.tickMarkViewProperty,
        tickMarkRangeProperty: this.tickMarkRangeProperty,
        unclampedFitnessProperty: model.unclampedFitnessProperty,
        ratioDescriber: this.ratioDescriber,
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

    this.mediaPipe = null;
    if ( RAPQueryParameters.mediaPipe ) {
      const mediaPipeBothHandsDescriber = new BothHandsDescriber(
        ratio.tupleProperty,
        ratio.enabledRatioTermsRangeProperty,
        ratio.lockedProperty,
        this.tickMarkViewProperty,
        model.inProportionProperty,
        this.ratioDescriber,
        new TickMarkDescriber( this.tickMarkRangeProperty, this.tickMarkViewProperty )
      );

      // TODO: isn't it better to tie this to a Node? https://github.com/phetsims/ratio-and-proportion/issues/454
      const mediaPipeVoicingUtterance = new Utterance( {
        alert: new ResponsePacket( {
          objectResponse: () => mediaPipeBothHandsDescriber.getBothHandsObjectResponse(),
          contextResponse: () => mediaPipeBothHandsDescriber.getBothHandsContextResponse( RatioInputModality.BOTH_HANDS )
        } ),

        // This number should be small, so that the most recent alert in the queue will immediately play once the announcer
        // is done with the previous response
        alertMaximumDelay: 50,
        announcerOptions: {

          // Every alert should be completed, otherwise there is no "hook" to get a full response without being
          // interrupted by the next alert (upon next Property change).
          cancelSelf: false
        }
      } );
      this.mediaPipe = new RAPMediaPipe( model.ratio.tupleProperty,
        this.antecedentRatioHalf.viewSounds,
        this.consequentRatioHalf.viewSounds, {
          onInput: () => {
            Voicing.alertUtterance( mediaPipeVoicingUtterance );
          },
          isBeingInteractedWithProperty: model.mediaPipeInteractedWithProperty
        } );

      // So that this Utterance does not announce unless the ScreenView is visible and voicingVisible.
      Voicing.registerUtteranceToNode( mediaPipeVoicingUtterance, this );

      this.mediaPipe.isBeingInteractedWithProperty.lazyLink( ( interactedWithMarkers: boolean ) => {
        if ( interactedWithMarkers ) {
          cueArrowsState.interactedWithMouseProperty.value = true;
        }
      } );
    }

    this.markerInput = null;

    if ( RAPQueryParameters.tangible ) {

      this.markerInput = new RAPMarkerInput( ratio.tupleProperty );

      this.markerInput.isBeingInteractedWithProperty.lazyLink( ( interactedWithMarkers: boolean ) => {
        if ( interactedWithMarkers ) {
          cueArrowsState.interactedWithMouseProperty.value = true;
        }
      } );
    }

    const soundGeneratorEnabledProperty = DerivedProperty.or( [
      this.antecedentRatioHalf.isBeingInteractedWithProperty,
      this.consequentRatioHalf.isBeingInteractedWithProperty,
      bothHandsPDOMNode.isBeingInteractedWithProperty,
      this.markerInput ? this.markerInput.isBeingInteractedWithProperty : new BooleanProperty( false ),
      this.mediaPipe ? this.mediaPipe.isBeingInteractedWithProperty : new BooleanProperty( false )
    ] );

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

    this.topScalingUILayerNode = new Node();
    this.bottomScalingUILayerNode = new Node();

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        cueArrowsState.reset();
        bothHandsPDOMNode.reset();
        this.markerInput && this.markerInput.reset();
        this.mediaPipe && this.mediaPipe.reset();
        this.reset();
      },
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );

    this.tickMarkViewRadioButtonGroup = new TickMarkViewRadioButtonGroup( this.tickMarkViewProperty, {
      tandem: options.tandem.createTandem( 'tickMarkViewRadioButtonGroup' )
    } );

    // add this Node to the layer that is scaled up to support vertical aspect ratios
    this.topScalingUILayerNode.addChild( this.tickMarkViewRadioButtonGroup );
    this.bottomScalingUILayerNode.addChild( this.resetAllButton );

    let positionRegionsNode: RAPPositionRegionsLayer | null = null;
    if ( RAPQueryParameters.showPositionRegions ) {
      positionRegionsNode = new RAPPositionRegionsLayer();
    }

    this.children = [
      labelsNode,

      // UI
      this.topScalingUILayerNode,
      this.bottomScalingUILayerNode,

      // Main ratio on top
      bothHandsPDOMNode
    ];
    positionRegionsNode && this.addChild( positionRegionsNode );

    // accessible order (ratio first in nav order)
    this.pdomPlayAreaNode.pdomOrder = [
      bothHandsPDOMNode,
      this.tickMarkViewRadioButtonGroup
    ];

    // accessible order
    this.pdomControlAreaNode.pdomOrder = [
      this.resetAllButton
    ];

    this.layoutRAPScreeView = newRatioHalfBounds => {

      // between 0 and 1, 0 is the min height, 1 is the max height
      const heightScalar = Utils.clamp( ( newRatioHalfBounds.height - LAYOUT_BOUNDS.height ) / ( MAX_RATIO_HEIGHT - LAYOUT_BOUNDS.height ), 0, 1 );

      this.antecedentRatioHalf.layout( newRatioHalfBounds, heightScalar );
      this.consequentRatioHalf.layout( newRatioHalfBounds, heightScalar );

      const ratioHalfDraggableArea = newRatioHalfBounds.height - ( 2 * this.antecedentRatioHalf.framingRectangleHeight );

      // subtract the top and bottom rectangles from the tick marks height
      labelsNode.layout( ratioHalfDraggableArea );

      const ratioWidth = this.antecedentRatioHalf.width + this.consequentRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + labelsNode.width;

      const uiLayerScale = uiScaleFunction.evaluate( newRatioHalfBounds.height );
      this.topScalingUILayerNode.setScaleMagnitude( uiLayerScale );
      this.bottomScalingUILayerNode.setScaleMagnitude( uiLayerScale );
      this.topScalingUILayerNode.top = uiPositionFunction.evaluate( uiLayerScale );

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

      if ( positionRegionsNode ) {
        const ratioHalvesWidth = this.antecedentRatioHalf.width + this.consequentRatioHalf.width + ( 2 * RATIO_HALF_SPACING ) + labelsNode.width;
        positionRegionsNode.layout( ratioHalvesWidth, ratioHalfDraggableArea );
        positionRegionsNode.left = this.antecedentRatioHalf.left;
        positionRegionsNode.bottom = this.layoutBounds.bottom - this.antecedentRatioHalf.framingRectangleHeight + ( positionRegionsNode.labelsHeight / 2 );
      }

      assert && assert( this.antecedentRatioHalf.width + this.consequentRatioHalf.width +
                        Math.max( this.topScalingUILayerNode.width, this.bottomScalingUILayerNode.width ) < LAYOUT_BOUNDS.width,
        'everything should fit inside layout bounds' );
    };
    this.layoutRAPScreeView( defaultRatioHalfBounds );
  }

  /**
   * Layout Nodes part of ethe screen viw. To accomplish, much of this was copied from ScreenView.layout, with
   * minor tweaks for this specific case. Also note Projectile Motion uses almost the exact same algorithm.
   */
  override layout( viewBounds: Bounds2 ): void {

    this.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, viewBounds, { verticalAlign: 'bottom' } );
    this.visibleBoundsProperty.value = this.parentToLocalBounds( viewBounds );

    const ratioHeight = Math.min( this.visibleBoundsProperty.value.height, MAX_RATIO_HEIGHT );
    this.layoutRAPScreeView( new Bounds2( 0, 0, ONE_QUARTER_LAYOUT_WIDTH, ratioHeight ) );
  }

  reset(): void {
    this.tickMarkRangeProperty.reset();
    this.tickMarkViewProperty.reset();
    this.antecedentRatioHalf.reset();
    this.consequentRatioHalf.reset();
    this.staccatoFrequencySoundGenerator.reset();
    this.inProportionSoundGenerator.reset();
    this.movingInProportionSoundGenerator.reset();
  }

  override step( dt: number ): void {

    this.mediaPipe && this.mediaPipe.step();
    this.markerInput && this.markerInput.step();
    this.inProportionSoundGenerator.step( dt );
    this.staccatoFrequencySoundGenerator.step( dt );
  }
}

ratioAndProportion.register( 'RAPScreenView', RAPScreenView );
export default RAPScreenView;