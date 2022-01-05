// Copyright 2020-2021, University of Colorado Boulder

/**
 * A single controllable half of the proportion. It contains a draggable hand that can change the value of this half (term)
 * of the ratio. This type can display tick marks that segment the movable space for the hand.
 *
 * A thick rectangle is placed on the top and bottom of this frame to cue the possible height that the pointer can be
 * dragged.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, NodeOptions, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import CueDisplay from './CueDisplay.js';
import RatioHalfTickMarksNode from './RatioHalfTickMarksNode.js';
import RatioHandNode from './RatioHandNode.js';
import ViewSounds from './sound/ViewSounds.js';
import TickMarkView from './TickMarkView.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import HandPositionsDescriber from './describers/HandPositionsDescriber.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import CueArrowsState from './CueArrowsState.js';
import RatioDescriber from './describers/RatioDescriber.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';

// constants
const MIN_FRAMING_RECTANGLE_HEIGHT = 32;
const MAX_FRAMING_RECTANGLE_HEIGHT = 64;

// Snap exclusive within this percentage of a tick mark. Thus actual snapping distance is based on the current tick
// mark range value.
const SNAP_TO_TICK_MARK_THRESHOLD = 0.1;

// total horizontal drag distance;
const X_MODEL_DRAG_DISTANCE = 1;
const INITIAL_X_VALUE = 0;
const getModelBoundsFromRange = ( range: Range ) => new Bounds2( -1 * X_MODEL_DRAG_DISTANCE / 2, range.min, X_MODEL_DRAG_DISTANCE / 2, range.max );

const MIN_HAND_SCALE = 1.2;
const MAX_HAND_SCALE = 2.5;

function ratioHalfAccessibleNameBehavior( node: RatioHalf, options: NodeOptions, accessibleName: string, callbacksForOtherNodes: { (): void }[] ) {
  callbacksForOtherNodes.push( () => {
    node.ratioHandNode.accessibleName = accessibleName;
  } );
  return options;
}

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

type LayoutFunction = ( bounds: Bounds2, heightScalar: number ) => void;

type RatioHalfDefinedOptions = {
  ratioTerm: RatioTerm;
  ratioTupleProperty: Property<RAPRatioTuple>;
  enabledRatioTermsRangeProperty: Property<Range>;
  displayBothHandsCueProperty: Property<boolean>;
  cueArrowsState: CueArrowsState;
  bounds: Bounds2;
  tickMarkViewProperty: Property<TickMarkView>;
  tickMarkRangeProperty: Property<number>;
  ratioDescriber: RatioDescriber;
  handPositionsDescriber: HandPositionsDescriber;
  bothHandsDescriber: BothHandsDescriber;

  // TODO: Why is lint wrong here? https://github.com/phetsims/ratio-and-proportion/issues/404
  colorProperty: Property<ColorDef>; // eslint-disable-line no-undef
  keyboardStep: number;
  horizontalMovementAllowedProperty: Property<boolean>;
  ratioLockedProperty: Property<boolean>;
  playTickMarkBumpSoundProperty: Property<boolean>;
  setJumpingOverProportionShouldTriggerSound: ( shouldTriggerSound: boolean ) => void;
  getIdealValue: () => number;
  inProportionProperty: IReadOnlyProperty<boolean>;
  isRight?: boolean;

  // TODO: Why is lint wrong here? https://github.com/phetsims/ratio-and-proportion/issues/404
  handColorProperty?: Property<ColorDef>; // eslint-disable-line no-undef
  a11yDependencies?: IReadOnlyProperty<any>[];
  bothHandsCueDisplay?: CueDisplay;
}

// TODO: Why is lint wrong here? https://github.com/phetsims/ratio-and-proportion/issues/404
// TODO: remove helpTextBehavior workaround when supported
type RatioHalfOptions =
  RatioHalfDefinedOptions
  & RectangleOptions
  & { helpTextBehavior?: ( node: Node, options: NodeOptions, helpText: string | null ) => NodeOptions }; // eslint-disable-line no-undef
type RatioHalfImplementationOptions = Required<RatioHalfDefinedOptions> & RectangleOptions; // eslint-disable-line no-undef

class RatioHalf extends Rectangle {


  public framingRectangleHeight: number;
  public readonly isBeingInteractedWithProperty: BooleanProperty;
  private ratioLockedProperty: Property<boolean>;
  private bothHandsDescriber: BothHandsDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private tickMarkViewProperty: Property<TickMarkView>;
  private ratioTerm: RatioTerm;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  ratioHandNode: RatioHandNode;
  private layoutRatioHalf: LayoutFunction;
  private resetRatioHalf: () => void;

  /**
   * @param {Object} [providedOptions]
   */
  constructor( providedOptions: RatioHalfOptions ) {

    const options = merge( {
      // ---- REQUIRED -------------------------------------------------

      // {RatioTerm}
      ratioTerm: required( providedOptions.ratioTerm ),

      // {Property.<RAPRatioTuple>}
      ratioTupleProperty: required( providedOptions.ratioTupleProperty ),

      // {Property.<Range>} - the current range that the hand can move
      enabledRatioTermsRangeProperty: required( providedOptions.enabledRatioTermsRangeProperty ),

      // {BooleanProperty}
      displayBothHandsCueProperty: required( providedOptions.displayBothHandsCueProperty ),

      // {CueArrowsState} - interaction state to determine the interaction cue to display
      cueArrowsState: required( providedOptions.cueArrowsState ),

      // {Bounds2} - the initial bounds that the Node takes up
      bounds: required( providedOptions.bounds ),

      // {EnumerationProperty.<TickMarkView>}
      tickMarkViewProperty: required( providedOptions.tickMarkViewProperty ),

      // {Property.<number>}
      tickMarkRangeProperty: required( providedOptions.tickMarkRangeProperty ),

      // {RatioDescriber}
      ratioDescriber: required( providedOptions.ratioDescriber ),

      // {HandPositionsDescriber}
      handPositionsDescriber: required( providedOptions.handPositionsDescriber ),

      // {BothHandsDescriber}
      bothHandsDescriber: required( providedOptions.bothHandsDescriber ),

      // {Property.<Color>}
      colorProperty: required( providedOptions.colorProperty ),

      // {number}
      keyboardStep: required( providedOptions.keyboardStep ),

      // {BooleanProperty}
      horizontalMovementAllowedProperty: required( providedOptions.horizontalMovementAllowedProperty ),

      // {BooleanProperty}
      ratioLockedProperty: required( providedOptions.ratioLockedProperty ),

      // {BooleanProperty}
      playTickMarkBumpSoundProperty: required( providedOptions.playTickMarkBumpSoundProperty ),

      // {function(boolean)} - see InProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound()
      setJumpingOverProportionShouldTriggerSound: required( providedOptions.setJumpingOverProportionShouldTriggerSound ),

      // {function():number} - a function that gets the value of this RatioHalf term that would achieve the targetRatio
      getIdealValue: required( providedOptions.getIdealValue ),

      // {Property.<boolean>} - is the model in proportion right now
      inProportionProperty: required( providedOptions.inProportionProperty ),

      // ---- OPTIONAL -------------------------------------------------

      // {boolean} right ratio or the left ratio
      isRight: true,

      // {Property.<ColorDef>} control the color of the hand
      handColorProperty: new Property( 'black' ),

      // {Array.<Property>} AccessibleValueHandler via RatioHandNode
      a11yDependencies: [],

      // {CueDisplay}
      bothHandsCueDisplay: CueDisplay.UP_DOWN,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioInputEnabledPropertyInstrumented: true,

      // pdom
      tagName: 'div',
      accessibleNameBehavior: ratioHalfAccessibleNameBehavior,
      accessibleName: null
    }, providedOptions ) as RatioHalfImplementationOptions;

    super( 0, 0, options.bounds.width, options.bounds.height );

    // @public (read-only) - the height of the framing rectangles, updated in layout function
    this.framingRectangleHeight = MIN_FRAMING_RECTANGLE_HEIGHT;

    // @public (read-only) - this behaves a bit differently depending on modality. For mouse/touch, any time you are
    // dragging this will be considered interaction, for keyboard, you must press a key before the interaction starts.
    this.isBeingInteractedWithProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isBeingInteractedWithProperty' )
    } );

    // @private
    this.ratioLockedProperty = options.ratioLockedProperty;
    this.bothHandsDescriber = options.bothHandsDescriber;
    this.handPositionsDescriber = options.handPositionsDescriber;
    this.tickMarkViewProperty = options.tickMarkViewProperty;
    this.ratioTerm = options.ratioTerm;
    this.ratioTupleProperty = options.ratioTupleProperty;

    const viewSounds = new ViewSounds( options.tickMarkRangeProperty, options.tickMarkViewProperty, options.playTickMarkBumpSoundProperty );

    // This follows the spec outlined in https://github.com/phetsims/ratio-and-proportion/issues/81
    const cueDisplayStateProperty: IReadOnlyProperty<CueDisplay> = new DerivedProperty( [
        options.cueArrowsState.interactedWithKeyboardProperty,
        options.cueArrowsState.interactedWithMouseProperty,
        options.cueArrowsState.keyboardFocusedProperty,
        options.cueArrowsState.bothHands.interactedWithProperty,
        options.displayBothHandsCueProperty
      ],
      ( interactedWithKeyboard: boolean,
        interactedWithMouse: boolean,
        keyboardFocused: boolean,
        bothHandsInteractedWith: boolean,
        displayBothHands: boolean ) => {
        return displayBothHands ? options.bothHandsCueDisplay :
               keyboardFocused && !interactedWithKeyboard ? CueDisplay.UP_DOWN :
               ( interactedWithKeyboard || interactedWithMouse || bothHandsInteractedWith ) ? CueDisplay.NONE :
               CueDisplay.ARROWS;
      } );


    // @public {Property.<number>} - Create a mapping directly to just this ratio term value. This is to support
    // AccessibleValueHandler, which powers the PDOM interaction off of {Property.<number>}.
    const ratioTermSpecificProperty = new DynamicProperty<number>( new Property<Property<RAPRatioTuple>>( this.ratioTupleProperty ), {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ( ratioTuple: RAPRatioTuple ) => ratioTuple.getForTerm( this.ratioTerm ),
      inverseMap: ( term: number ) => this.ratioTerm === RatioTerm.ANTECEDENT ? this.ratioTupleProperty.value.withAntecedent( term ) :
                                      this.ratioTerm === RatioTerm.CONSEQUENT ? this.ratioTupleProperty.value.withConsequent( term ) :
                                      assert && assert( false, `unexpected ratioTerm ${this.ratioTerm}` )
    } ) as Property<number>;

    const createObjectResponse = () => options.ratioLockedProperty.value ? options.ratioDescriber.getProximityToChallengeRatio() :
                                       options.ratioDescriber.getProximityToChallengeRatio();

    // @private - The draggable element inside the Node framed with thick rectangles on the top and bottom.
    this.ratioHandNode = new RatioHandNode( ratioTermSpecificProperty,
      options.enabledRatioTermsRangeProperty,
      options.tickMarkViewProperty,
      options.keyboardStep,
      options.handColorProperty,
      cueDisplayStateProperty,
      options.getIdealValue,
      options.inProportionProperty, {
        startDrag: () => {
          options.cueArrowsState.interactedWithKeyboardProperty.value = true;
          this.isBeingInteractedWithProperty.value = true;
          viewSounds.boundarySoundClip.onStartInteraction();
        },
        drag: () => {
          viewSounds.boundarySoundClip.onInteract( options.ratioTupleProperty.value.getForTerm( this.ratioTerm ) );
          viewSounds.tickMarkBumpSoundClip.onInteract( options.ratioTupleProperty.value.getForTerm( this.ratioTerm ) );
        },
        endDrag: () => {
          viewSounds.boundarySoundClip.onEndInteraction( options.ratioTupleProperty.value.getForTerm( this.ratioTerm ) );
        },
        isRight: options.isRight,

        a11yCreateAriaValueText: createObjectResponse,
        voicingCreateObjectResponse: createObjectResponse,
        a11yCreateContextResponseAlert: () => this.getSingleHandContextResponse(),
        voicingCreateContextResponse: () => this.getSingleHandContextResponse(),
        a11yDependencies: options.a11yDependencies.concat( [ options.ratioLockedProperty ] ),
        voicingNameResponse: options.accessibleName // accessible name is also the voicing name response
      } );

    // This can change anytime there is a layout update.
    let modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      getModelBoundsFromRange( TOTAL_RANGE ),
      options.bounds );

    // Snap mouse/touch input to the nearest tick mark if close enough. This helps with reproducible precision
    const getSnapToTickMarkValue = ( yValue: number ) => {
      if ( TickMarkView.displayHorizontal( options.tickMarkViewProperty.value ) ) {
        const tickMarkStep = 1 / options.tickMarkRangeProperty.value;

        // iterate through model values of each tick mark
        for ( let i = TOTAL_RANGE.min; i < TOTAL_RANGE.max; i += tickMarkStep ) {
          if ( Math.abs( yValue - i ) < tickMarkStep * SNAP_TO_TICK_MARK_THRESHOLD ) {
            return i;
          }
        }
      }

      // No snapping in this case, just return the provided value.
      return yValue;
    };

    const initialVector = new Vector2( INITIAL_X_VALUE, 0 );
    let mappingInitialValue = true;

    // Only the RatioHalf DragListener allows for horizontal movement, so support that here. This adds the horizontal axis.
    // We expand on ratioTermSpecificProperty since we already have it, but we could also just use the ratioTupleProperty.
    const positionProperty = new DynamicProperty<Vector2>( new Property<Property<number>>( ratioTermSpecificProperty ), {
      reentrant: true,
      bidirectional: true,
      valueType: Vector2,
      inverseMap: ( vector2: Vector2 ) => vector2.y,
      map: ( number: number ) => {

        // initial case
        if ( mappingInitialValue ) {
          mappingInitialValue = false;
          return initialVector.setY( number );
        }
        else {
          return positionProperty.value.copy().setY( number );
        }
      }
    } );

    const dragBoundsProperty = new Property( new Bounds2( 0, 0, 1, 1 ) );

    // When set to a value, the horizontal position will not be changed throughout the whole drag. Set to null when not dragging.
    let startingX: null | number = null;
    let startingY: number = -1;

    const voicingUtteranceForDrag = new Utterance( {
      alertMaximumDelay: 500,
      announcerOptions: {
        cancelSelf: false
      }
    } );

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      start: () => {
        if ( options.horizontalMovementAllowedProperty.value ) {
          startingX = positionProperty.value.x;
        }

        startingY = positionProperty.value.y;

        viewSounds.grabSoundClip.play();
        options.cueArrowsState.interactedWithMouseProperty.value = true;

        options.setJumpingOverProportionShouldTriggerSound( true );
        viewSounds.boundarySoundClip.onStartInteraction();

        // @ts-ignore
        this.ratioHandNode.voicingObjectResponse = createObjectResponse();

        // @ts-ignore
        this.ratioHandNode.voicingSpeakFullResponse( {
          contextResponse: null,
          hintResponse: null
        } );
      },
      drag: () => {
        this.isBeingInteractedWithProperty.value = true;

        if ( typeof startingX === 'number' ) {
          positionProperty.value.setX( startingX );
          positionProperty.notifyListenersStatic();
        }

        viewSounds.boundarySoundClip.onInteract( positionProperty.value.y, positionProperty.value.x,
          new Range( dragBoundsProperty.value.left, dragBoundsProperty.value.right ) );
        viewSounds.tickMarkBumpSoundClip.onInteract( positionProperty.value.y );

        // @ts-ignore
        this.ratioHandNode.voicingOnChangeResponse( {
          utterance: voicingUtteranceForDrag
      } );
      },

      end: () => {

        // reset logic in the hand that controls other input
        this.ratioHandNode.reset();

        // snap final value to tick mark, if applicable
        const newY = getSnapToTickMarkValue( positionProperty.value.y );
        if ( positionProperty.value.y !== newY ) {
          positionProperty.value.setY( newY );
          positionProperty.notifyListenersStatic();
        }

        startingX = null;
        viewSounds.releaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
        options.setJumpingOverProportionShouldTriggerSound( false );
        viewSounds.boundarySoundClip.onEndInteraction( positionProperty.value.y );

        // Support context response on interaction end from mouse/touch input.
        // @ts-ignore
        this.ratioHandNode.alertContextResponse();

        // Only voice a response if the value changed
        if ( startingY !== positionProperty.value.y ) {

          // TODO: should this have the object response too, or just the context repsonse?? https://github.com/phetsims/ratio-and-proportion/issues/413
          // @ts-ignore
          this.ratioHandNode.voicingOnEndResponse( {
            onlyOnValueChange: false // don't use the AccessibleValueHandler's start, and instead handle it ourselves
          } );
        }
        else {

          // TODO: Hint response if there isn't any movement? https://github.com/phetsims/ratio-and-proportion/issues/413
          // @ts-ignore
          this.ratioHandNode.voicingSpeakHintResponse();
        }
      },

      // phet-io
      tandem: options.tandem.createTandem( 'dragListener' )
    } );

    // When the range changes, update the dragBounds of the drag listener
    options.enabledRatioTermsRangeProperty.link( enabledRange => {
      const newBounds = getModelBoundsFromRange( enabledRange );

      // offset the bounds to account for the ratioHandNode's size, since the center of the ratioHandNode is controlled by the drag bounds.
      const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( this.ratioHandNode.width / 2, -this.framingRectangleHeight );

      // constrain x dimension inside the RatioHalf so that this.ratioHandNode doesn't go beyond the width. Height is constrained
      // via the modelViewTransform.
      dragBoundsProperty.value = newBounds.erodedX( modelHalfPointerPointer.x );
    } );

    this.ratioHandNode.addInputListener( dragListener );
    this.ratioHandNode.addInputListener( {
      focus: () => {
        options.cueArrowsState.keyboardFocusedProperty.value = true;
        viewSounds.grabSoundClip.play();
      },
      blur: () => {
        options.cueArrowsState.keyboardFocusedProperty.value = false;
        viewSounds.releaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      },
      down: () => {

        // Support the case when you have the hand focused, and then you press the hand with a mouse
        options.cueArrowsState.keyboardFocusedProperty.value = false;
      }
    } );

    // "Framing" rectangles on the top and bottom of the drag area of the ratio half
    const topRect = new Rectangle( 0, 0, 10, this.framingRectangleHeight, { fill: options.colorProperty } );
    const bottomRect = new Rectangle( 0, 0, 10, this.framingRectangleHeight, { fill: options.colorProperty } );

    const tickMarksNode = new RatioHalfTickMarksNode( options.tickMarkViewProperty, options.tickMarkRangeProperty,
      options.bounds.width, options.bounds.height - 2 * this.framingRectangleHeight,
      options.colorProperty );

    const updatePointer = ( position: Vector2 ) => {
      this.ratioHandNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    positionProperty.link( updatePointer );

    // @ts-ignore TODO RectangleOptions defined in phet-types is fundamentally incompatible with Node's NodeOptions. Once Rectangle is TS'ed, we should use RectangleOptions
    this.mutate( options );

    assert && assert( !options.children, 'RatioHalf sets its own children.' );
    this.children = [
      topRect,
      bottomRect,
      tickMarksNode,
      this.ratioHandNode
    ];

    // @private
    this.layoutRatioHalf = ( newBounds, heightScalar ) => {
      this.rectWidth = newBounds.width;
      this.rectHeight = newBounds.height;

      this.framingRectangleHeight = topRect.rectHeight = bottomRect.rectHeight = heightScalar * MIN_FRAMING_RECTANGLE_HEIGHT + ( MAX_FRAMING_RECTANGLE_HEIGHT - MIN_FRAMING_RECTANGLE_HEIGHT );

      // Scale depending on how tall the ratio half is. This is to support narrow and tall layouts where the hand needs
      // to be scaled up more to support touch interaction, see https://github.com/phetsims/ratio-and-proportion/issues/217.
      const handScale = heightScalar * ( MAX_HAND_SCALE - MIN_HAND_SCALE ) + MIN_HAND_SCALE;
      this.ratioHandNode.setScaleMagnitude( handScale );

      const framingRectWidth = newBounds.width - newBounds.width * 0.1;
      topRect.rectWidth = framingRectWidth;
      topRect.centerX = bottomRect.centerX = newBounds.centerX;
      bottomRect.rectWidth = framingRectWidth;
      topRect.top = 0;
      bottomRect.bottom = newBounds.height;

      const boundsNoFramingRects = newBounds.erodedY( this.framingRectangleHeight );

      // Don't count the space the framing rectangles take up as part of the draggableArea.
      modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        getModelBoundsFromRange( TOTAL_RANGE ),
        boundsNoFramingRects
      );

      updatePointer( positionProperty.value );

      dragListener.transform = modelViewTransform;

      tickMarksNode.layout( boundsNoFramingRects.width, boundsNoFramingRects.height );
      tickMarksNode.bottom = bottomRect.top;
      tickMarksNode.left = 0;
    };

    // @private
    this.resetRatioHalf = () => {
      this.ratioHandNode.reset();
      viewSounds.reset();
      positionProperty.value.setX( INITIAL_X_VALUE );
      positionProperty.notifyListenersStatic();
    };
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object and the subsequent change
   * in ratio. This is the context response for the individual ratio half hand (slider) interaction.
   * @public
   * @returns {null|string} - null means no alert will occur
   */
  getSingleHandContextResponse(): null | string {

    // When locked, give a description of both-hands, instead of just a single one.
    if ( this.ratioLockedProperty.value ) {
      return this.bothHandsDescriber.getBothHandsContextResponse();
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse, {
      distance: this.handPositionsDescriber.getSingleHandDistance( this.ratioTerm ),
      position: this.handPositionsDescriber.getHandPositionDescription( this.ratioTupleProperty.value.getForTerm( this.ratioTerm ),
        this.tickMarkViewProperty.value )
    } );
  }

  /**
   * The bottom of the Rectangle that contains the RatioHandNode is not the complete bounds of the Node. With that in
   * mind, offset the bottom by the height that extends beyond the Rectangle. For example, the cue arrows of the RatioHandNode can extend beyond the
   * "ratio half box" (the draggable area).
   * @public
   * @param {number} desiredBottom
   */
  setBottomOfRatioHalf( desiredBottom: number ): void {

    // `selfBounds` is used for the position of the Rectangle, since RatioHalf extends Rectangle
    this.bottom = desiredBottom + ( this.bounds.bottom - this.localToParentBounds( this.selfBounds ).bottom );
  }

  /**
   * @public
   * @param {Bounds2} bounds - the bounds of this RatioHalf, effects dimensions, dragBounds, and width of guiding rectangles
   * @param {number} heightScalar - normalized between 0 and 1. When 1, it the ratio half will be the tallest it gets, at 0, the shortest
   */
  layout( bounds: Bounds2, heightScalar: number ): void {
    assert && assert( heightScalar >= 0 && heightScalar <= 1, 'scalar should be between 0 and 1' );
    this.layoutRatioHalf( bounds, heightScalar );
  }

  /**
   * @public
   */
  reset(): void {
    this.resetRatioHalf();
  }
}

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;