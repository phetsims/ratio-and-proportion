// Copyright 2020-2022, University of Colorado Boulder

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
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, IPaint, Node, NodeOptions, Rectangle, RectangleOptions } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import CueDisplay from './CueDisplay.js';
import RatioHalfTickMarksNode from './RatioHalfTickMarksNode.js';
import RatioHandNode from './RatioHandNode.js';
import ViewSounds from './sound/ViewSounds.js';
import TickMarkView from './TickMarkView.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import HandPositionsDescriber, { SingleHandContextResponseOptions } from './describers/HandPositionsDescriber.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import CueArrowsState from './CueArrowsState.js';
import RatioDescriber from './describers/RatioDescriber.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import DistanceResponseType from './describers/DistanceResponseType.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import MappedProperty from '../../../../axon/js/MappedProperty.js';
import RAPRatio from '../model/RAPRatio.js';

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

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

type LayoutFunction = ( bounds: Bounds2, heightScalar: number ) => void;

type SelfOptions = {
  ratioTerm: RatioTerm;
  ratio: RAPRatio;
  displayBothHandsCueProperty: Property<boolean>;
  cueArrowsState: CueArrowsState; // interaction state to determine the interaction cue to display
  bounds: Bounds2; // the initial bounds that the Node takes up
  tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  tickMarkRangeProperty: Property<number>;
  ratioDescriber: RatioDescriber;
  handPositionsDescriber: HandPositionsDescriber;
  voicingHandPositionsDescriber: HandPositionsDescriber;
  bothHandsDescriber: BothHandsDescriber;

  colorProperty: IPaint;
  keyboardStep: number;
  horizontalMovementAllowedProperty: Property<boolean>;
  playTickMarkBumpSoundProperty: Property<boolean>;

  // see InProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound()
  setJumpingOverProportionShouldTriggerSound: ( shouldTriggerSound: boolean ) => void;

  // a function that gets the value of this RatioHalf term that would achieve the targetRatio
  getIdealValue: () => number;

  // is the model in proportion right now
  inProportionProperty: IReadOnlyProperty<boolean>;

  // right ratio or the left ratio
  isRight?: boolean;

  // control the color of the hand
  handColorProperty?: IPaint;

  // AccessibleValueHandler via RatioHandNode
  a11yDependencies?: IReadOnlyProperty<IntentionalAny>[];
  bothHandsCueDisplay?: CueDisplay;
}

type RatioHalfOptions = SelfOptions & RectangleOptions;

class RatioHalf extends Rectangle {

  // the height of the framing rectangles, updated in layout function
  _framingRectangleHeight: number;

  // This behaves a bit differently depending on modality. For mouse/touch, any time you are
  // dragging this will be considered interaction, for keyboard, you must press a key before the interaction starts.
  // Note both members to keep a public readonly interface.
  readonly isBeingInteractedWithProperty: IReadOnlyProperty<boolean>;
  private readonly _isBeingInteractedWithProperty: BooleanProperty;

  private readonly ratio: RAPRatio;
  private readonly bothHandsDescriber: BothHandsDescriber;
  private readonly handPositionsDescriber: HandPositionsDescriber;
  private readonly voicingHandPositionsDescriber: HandPositionsDescriber;
  private readonly tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private readonly ratioTerm: RatioTerm;

  // The draggable element inside the Node framed with thick rectangles on the top and bottom.
  private ratioHandNode: RatioHandNode;
  private layoutRatioHalf: LayoutFunction;
  private resetRatioHalf: () => void;

  // Access this to use view sounds related to this RatioHalf.
  viewSounds: ViewSounds;

  constructor( providedOptions: RatioHalfOptions ) {

    const options = optionize<RatioHalfOptions, SelfOptions, RectangleOptions, 'tandem'>( {
      isRight: true,
      handColorProperty: new Property( 'black' ),
      a11yDependencies: [],
      bothHandsCueDisplay: CueDisplay.UP_DOWN,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioInputEnabledPropertyInstrumented: true,

      // pdom
      tagName: 'div',
      accessibleNameBehavior: RatioHalf.RATIO_HALF_ACCESSIBLE_NAME_BEHAVIOR,
      accessibleName: null
    }, providedOptions );

    super( 0, 0, options.bounds.width, options.bounds.height );

    this._framingRectangleHeight = MIN_FRAMING_RECTANGLE_HEIGHT;

    // Tandem is a different name to keep a `public readonly` interface without depending on getters and setters.
    this._isBeingInteractedWithProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isBeingInteractedWithProperty' )
    } );
    this.isBeingInteractedWithProperty = this._isBeingInteractedWithProperty;

    this.ratio = options.ratio;
    this.bothHandsDescriber = options.bothHandsDescriber;
    this.handPositionsDescriber = options.handPositionsDescriber;
    this.voicingHandPositionsDescriber = options.voicingHandPositionsDescriber;
    this.tickMarkViewProperty = options.tickMarkViewProperty;
    this.ratioTerm = options.ratioTerm;

    this.viewSounds = new ViewSounds( options.tickMarkRangeProperty, options.tickMarkViewProperty, options.playTickMarkBumpSoundProperty );

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


    // Create a mapping directly to just this ratio term value. This is to support
    // AccessibleValueHandler, which powers the PDOM interaction off of {Property.<number>}.
    const ratioTermSpecificProperty = new MappedProperty( this.ratio.tupleProperty, {
      bidirectional: true,
      reentrant: true,
      valueType: 'number',
      map: ( ratioTuple: RAPRatioTuple ) => ratioTuple.getForTerm( this.ratioTerm ),
      inverseMap: ( term: number ) => this.ratioTerm === RatioTerm.ANTECEDENT ? this.ratio.tupleProperty.value.withAntecedent( term ) :
                                      this.ratioTerm === RatioTerm.CONSEQUENT ? this.ratio.tupleProperty.value.withConsequent( term ) :
                                      ( assert && assert( false, `unexpected ratioTerm ${this.ratioTerm}` ) ) as unknown as RAPRatioTuple
    } ) as Property<number>;

    const createObjectResponse = () => this.ratio.lockedProperty.value ? options.ratioDescriber.getProximityToChallengeRatio() :
                                       options.ratioDescriber.getProximityToChallengeRatio();

    this.ratioHandNode = new RatioHandNode( ratioTermSpecificProperty,
      this.ratio.enabledRatioTermsRangeProperty,
      options.tickMarkViewProperty,
      options.keyboardStep,
      options.handColorProperty,
      cueDisplayStateProperty,
      options.getIdealValue,
      options.inProportionProperty, {
        startDrag: () => {
          options.cueArrowsState.interactedWithKeyboardProperty.value = true;
          this._isBeingInteractedWithProperty.value = true;
          this.viewSounds.boundarySoundClip.onStartInteraction();
        },
        drag: () => {
          this.viewSounds.boundarySoundClip.onInteract( this.ratio.tupleProperty.value.getForTerm( this.ratioTerm ) );
          this.viewSounds.tickMarkBumpSoundClip.onInteract( this.ratio.tupleProperty.value.getForTerm( this.ratioTerm ) );
        },
        endDrag: () => {
          this.viewSounds.boundarySoundClip.onEndInteraction( this.ratio.tupleProperty.value.getForTerm( this.ratioTerm ) );
        },
        isRight: options.isRight,

        a11yCreateAriaValueText: createObjectResponse,
        voicingObjectResponse: createObjectResponse,

        a11yCreateContextResponseAlert: () => this.getSingleHandContextResponse( this.handPositionsDescriber ),
        voicingContextResponse: () => this.getSingleHandContextResponse( this.voicingHandPositionsDescriber ),
        a11yDependencies: options.a11yDependencies.concat( [ this.ratio.lockedProperty ] ),
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
    // We expand on ratioTermSpecificProperty since we already have it, but we could also just use the ratio.tupleProperty.
    const positionProperty: MappedProperty<Vector2, number> = new MappedProperty( ratioTermSpecificProperty, {
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
    let startingY = -1;

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      dragBoundsProperty: dragBoundsProperty,
      start: () => {
        if ( options.horizontalMovementAllowedProperty.value ) {
          startingX = positionProperty.value.x;
        }

        startingY = positionProperty.value.y;

        this.viewSounds.grabSoundClip.play();
        options.cueArrowsState.interactedWithMouseProperty.value = true;

        options.setJumpingOverProportionShouldTriggerSound( true );
        this.viewSounds.boundarySoundClip.onStartInteraction();

        this.ratioHandNode.voicingSpeakFullResponse( {
          contextResponse: null
        } );
      },
      drag: () => {
        this._isBeingInteractedWithProperty.value = true;

        if ( typeof startingX === 'number' ) {
          positionProperty.value.setX( startingX );
          positionProperty.notifyListenersStatic();
        }

        this.viewSounds.boundarySoundClip.onInteract( positionProperty.value.y, positionProperty.value.x,
          new Range( dragBoundsProperty.value.left, dragBoundsProperty.value.right ) );
        this.viewSounds.tickMarkBumpSoundClip.onInteract( positionProperty.value.y );

        this.ratioHandNode.voicingSpeakFullResponse( {
          nameResponse: null,
          contextResponse: this.getSingleHandContextResponse( this.voicingHandPositionsDescriber, {
            distanceResponseType: DistanceResponseType.DISTANCE_PROGRESS
          } ),
          hintResponse: null
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
        this.viewSounds.releaseSoundClip.play();
        this._isBeingInteractedWithProperty.value = false;
        options.setJumpingOverProportionShouldTriggerSound( false );
        this.viewSounds.boundarySoundClip.onEndInteraction( positionProperty.value.y );

        // Support context response on interaction end from mouse/touch input.
        this.ratioHandNode.alertContextResponse();

        // Only voice a response if the value changed
        if ( startingY !== positionProperty.value.y ) {

          this.ratioHandNode.voicingSpeakFullResponse( {
            nameResponse: null,
            contextResponse: this.getSingleHandContextResponse( this.voicingHandPositionsDescriber, {
              distanceResponseType: DistanceResponseType.DISTANCE_REGION
            } ),
            hintResponse: null
          } );
        }
        else {
          // No voicing if there hasn't been any movement
        }
      },

      // phet-io
      tandem: options.tandem.createTandem( 'dragListener' )
    } );

    // When the range changes, update the dragBounds of the drag listener
    this.ratio.enabledRatioTermsRangeProperty.link( ( enabledRange: Range ) => {
      const newBounds = getModelBoundsFromRange( enabledRange );

      // offset the bounds to account for the ratioHandNode's size, since the center of the ratioHandNode is controlled by the drag bounds.
      const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( this.ratioHandNode.width / 2, -this._framingRectangleHeight );

      // constrain x dimension inside the RatioHalf so that this.ratioHandNode doesn't go beyond the width. Height is constrained
      // via the modelViewTransform.
      dragBoundsProperty.value = newBounds.erodedX( modelHalfPointerPointer.x );
    } );

    this.ratioHandNode.addInputListener( dragListener );
    this.ratioHandNode.addInputListener( {
      focus: () => {
        options.cueArrowsState.keyboardFocusedProperty.value = true;
        this.viewSounds.grabSoundClip.play();
      },
      blur: () => {
        options.cueArrowsState.keyboardFocusedProperty.value = false;
        this.viewSounds.releaseSoundClip.play();
        this._isBeingInteractedWithProperty.value = false;
      },
      down: () => {

        // Support the case when you have the hand focused, and then you press the hand with a mouse
        options.cueArrowsState.keyboardFocusedProperty.value = false;
      }
    } );

    // "Framing" rectangles on the top and bottom of the drag area of the ratio half
    const topRect = new Rectangle( 0, 0, 10, this._framingRectangleHeight, { fill: options.colorProperty } );
    const bottomRect = new Rectangle( 0, 0, 10, this._framingRectangleHeight, { fill: options.colorProperty } );

    const tickMarksNode = new RatioHalfTickMarksNode( options.tickMarkViewProperty, options.tickMarkRangeProperty,
      options.bounds.width, options.bounds.height - 2 * this._framingRectangleHeight,
      options.colorProperty );

    const updatePointer = ( position: Vector2 ) => {
      this.ratioHandNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    positionProperty.link( updatePointer );

    this.mutate( options );

    assert && assert( !options.children, 'RatioHalf sets its own children.' );
    this.children = [
      topRect,
      bottomRect,
      tickMarksNode,
      ( this.ratioHandNode )
    ];

    this.layoutRatioHalf = ( newBounds, heightScalar ) => {
      this.rectWidth = newBounds.width;
      this.rectHeight = newBounds.height;

      this._framingRectangleHeight = topRect.rectHeight = bottomRect.rectHeight = heightScalar * MIN_FRAMING_RECTANGLE_HEIGHT + ( MAX_FRAMING_RECTANGLE_HEIGHT - MIN_FRAMING_RECTANGLE_HEIGHT );

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

      const boundsNoFramingRects = newBounds.erodedY( this._framingRectangleHeight );

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

    this.resetRatioHalf = () => {
      this.ratioHandNode.reset();
      this.viewSounds.reset();
      positionProperty.value.setX( INITIAL_X_VALUE );
      positionProperty.notifyListenersStatic();
    };
  }

  // Provide a getter but not a setter to denote "public readonly"
  get framingRectangleHeight(): number {
    return this._framingRectangleHeight;
  }

  /**
   * Generate and send an alert to the UtteranceQueue that describes the movement of this object and the subsequent change
   * in ratio. This is the context response for the individual ratio half hand (slider) interaction. Returning
   * null means no alert will occur.
   */
  getSingleHandContextResponse( handPositionsDescriber: HandPositionsDescriber, options?: SingleHandContextResponseOptions ): string {

    // When locked, give a description of both-hands, instead of just a single one.
    if ( this.ratio.lockedProperty.value ) {
      return this.bothHandsDescriber.getBothHandsContextResponse();
    }

    return handPositionsDescriber.getSingleHandContextResponse( this.ratioTerm, this.tickMarkViewProperty.value, options );
  }

  /**
   * The bottom of the Rectangle that contains the RatioHandNode is not the complete bounds of the Node. With that in
   * mind, offset the bottom by the height that extends beyond the Rectangle. For example, the cue arrows of the RatioHandNode can extend beyond the
   * "ratio half box" (the draggable area).
   */
  setBottomOfRatioHalf( desiredBottom: number ): void {

    // `selfBounds` is used for the position of the Rectangle, since RatioHalf extends Rectangle
    this.bottom = desiredBottom + ( this.bounds.bottom - this.localToParentBounds( this.selfBounds ).bottom );
  }

  /**
   * @param bounds - the bounds of this RatioHalf, effects dimensions, dragBounds, and width of guiding rectangles
   * @param heightScalar - normalized between 0 and 1. When 1, it the ratio half will be the tallest it gets, at 0, the shortest
   */
  layout( bounds: Bounds2, heightScalar: number ): void {
    assert && assert( heightScalar >= 0 && heightScalar <= 1, 'scalar should be between 0 and 1' );
    this.layoutRatioHalf( bounds, heightScalar );
  }

  reset(): void {
    this.resetRatioHalf();
  }

  private static RATIO_HALF_ACCESSIBLE_NAME_BEHAVIOR( node: Node, options: NodeOptions, accessibleName: string, callbacksForOtherNodes: { (): void }[] ) {

    callbacksForOtherNodes.push( () => {
      ( node as RatioHalf ).ratioHandNode.accessibleName = accessibleName;
    } );
    return options;
  }
}

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;