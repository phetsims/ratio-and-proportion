// Copyright 2020, University of Colorado Boulder

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
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import CueDisplay from './CueDisplay.js';
import RatioHalfTickMarksNode from './RatioHalfTickMarksNode.js';
import RatioHandNode from './RatioHandNode.js';
import TickMarkView from './TickMarkView.js';

// constants
const MIN_FRAMING_RECTANGLE_HEIGHT = 32;
const MAX_FRAMING_RECTANGLE_HEIGHT = 64;

// This value was calculated based on the design of snapping within the range of the ratio hand center circle, see https://github.com/phetsims/ratio-and-proportion/issues/122#issuecomment-672281015
const SNAP_TO_TICK_MARK_THRESHOLD = .135842179584 / 2;

// total horizontal drag distance;
const X_MODEL_DRAG_DISTANCE = 1;
const INITIAL_X_VALUE = 0;
const getModelBoundsFromRange = range => new Bounds2( -1 * X_MODEL_DRAG_DISTANCE / 2, range.min, X_MODEL_DRAG_DISTANCE / 2, range.max );

const MIN_HAND_SCALE = 1.2;
const MAX_HAND_SCALE = 2.5;

function ratioHalfAccessibleNameBehavior( node, options, accessibleName, callbacksForOtherNodes ) {
  callbacksForOtherNodes.push( () => {
    node.ratioHandNode.accessibleName = accessibleName;
  } );
  return options;
}

class RatioHalf extends Rectangle {

  /**
   * @param {NumberProperty} valueProperty
   * @param {Range} valueRange - the total range of the hand
   * @param {Property.<Range>} enabledRatioTermsRangeProperty - the current range that the hand can move
   * @param {BooleanProperty} displayBothHandsCueProperty
   * @param {CueArrowsState} cueArrowsState - interaction state to determine the interaction cue to display
   * @param {Bounds2} bounds - the initial bounds that the Node takes up
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {BothHandsDescriber} bothHandsDescriber
   * @param {Property.<Color>} colorProperty
   * @param {number} keyboardStep
   * @param {BooleanProperty} horizontalMovementAllowedProperty
   * @param {BooleanProperty} ratioLockedProperty
   * @param {ViewSounds} viewSounds
   * @param {InProportionSoundGenerator} inProportionSoundGenerator
   * @param {function():number} getIdealValue - a function that gets the value of this RatioHalf term that would achieve the targetRatio
   * @param {Object} [options]
   */
  constructor( valueProperty,
               valueRange,
               enabledRatioTermsRangeProperty,
               displayBothHandsCueProperty,
               cueArrowsState,
               bounds,
               tickMarkViewProperty,
               tickMarkRangeProperty,
               ratioDescriber,
               handPositionsDescriber,
               bothHandsDescriber,
               colorProperty,
               keyboardStep,
               horizontalMovementAllowedProperty,
               ratioLockedProperty,
               viewSounds,
               inProportionSoundGenerator,
               getIdealValue,
               options ) {

    options = merge( {
      isRight: true, // right ratio or the left ratio

      // control the color of the hand
      handColorProperty: new Property( 'black' ),

      tandem: Tandem.OPTIONAL,

      // AccessibleValueHandler via RatioHandNode
      a11yDependencies: [],

      // {CueDisplay}
      bothHandsCueDisplay: CueDisplay.UP_DOWN,

      // pdom
      tagName: 'div',
      accessibleNameBehavior: ratioHalfAccessibleNameBehavior
    }, options );

    super( 0, 0, bounds.width, bounds.height );

    // @public (read-only) - the height of the framing rectangles, updated in layout function
    this.framingRectangleHeight = MIN_FRAMING_RECTANGLE_HEIGHT;

    // @public (read-only) - this behaves a bit differently depending on modality. For mouse/touch, any time you are
    // dragging this will be considered interaction, for keyboard, you must press a key before the interaction starts.
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // @private
    this.ratioLockedProperty = ratioLockedProperty;
    this.bothHandsDescriber = bothHandsDescriber;
    this.handPositionsDescriber = handPositionsDescriber;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.valueProperty = valueProperty;

    // This follows the spec outlined in https://github.com/phetsims/ratio-and-proportion/issues/81
    const cueDisplayStateProperty = new DerivedProperty( [
        cueArrowsState.interactedWithKeyboardProperty,
        cueArrowsState.interactedWithMouseProperty,
        cueArrowsState.keyboardFocusedProperty,
        cueArrowsState.bothHands.interactedWithProperty,
        displayBothHandsCueProperty
      ],
      ( interactedWithKeyboard, interactedWithMouse, keyboardFocused, bothHandsInteractedWith, displayBothHands ) => {
        return displayBothHands ? options.bothHandsCueDisplay :
               keyboardFocused && !interactedWithKeyboard ? CueDisplay.UP_DOWN :
               ( interactedWithKeyboard || interactedWithMouse || bothHandsInteractedWith ) ? CueDisplay.NONE :
               CueDisplay.ARROWS;
      } );

    // "Framing" rectangles on the top and bottom of the drag area of the ratio half
    const topRect = new Rectangle( 0, 0, 10, this.framingRectangleHeight, { fill: colorProperty } );
    this.addChild( topRect );
    const bottomRect = new Rectangle( 0, 0, 10, this.framingRectangleHeight, { fill: colorProperty } );
    this.addChild( bottomRect );

    const tickMarksNode = new RatioHalfTickMarksNode( tickMarkViewProperty, tickMarkRangeProperty,
      bounds.width, bounds.height - 2 * this.framingRectangleHeight,
      colorProperty );
    this.addChild( tickMarksNode );

    // @private - The draggable element inside the Node framed with thick rectangles on the top and bottom.
    this.ratioHandNode = new RatioHandNode( valueProperty, enabledRatioTermsRangeProperty, tickMarkViewProperty,
      keyboardStep, options.handColorProperty, cueDisplayStateProperty, getIdealValue, {
        startDrag: () => {
          cueArrowsState.interactedWithKeyboardProperty.value = true;
          this.isBeingInteractedWithProperty.value = true;
          viewSounds.boundarySoundClip.onStartInteraction();
        },
        drag: () => {
          viewSounds.boundarySoundClip.onInteract( valueProperty.value );
          viewSounds.tickMarkBumpSoundClip.onInteract( valueProperty.value );
        },
        endDrag: () => {
          viewSounds.boundarySoundClip.onEndInteraction( valueProperty.value );
        },
        isRight: options.isRight,

        a11yCreateAriaValueText: () => ratioLockedProperty.value ? ratioDescriber.getProximityToChallengeRatio() :
                                       ratioDescriber.getProximityToChallengeRatio(),
        a11yCreateContextResponseAlert: () => this.getSingleHandContextResponse(),
        a11yDependencies: options.a11yDependencies.concat( [ ratioLockedProperty ] )
      } );
    this.addChild( this.ratioHandNode );

    // This can change anytime there is a layout update.
    let modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      getModelBoundsFromRange( valueRange ),
      bounds );

    // Snap mouse/touch input to the nearest tick mark if close enough. This helps with reproducible precision
    const getSnapToTickMarkValue = yValue => {
      if ( TickMarkView.displayHorizontal( tickMarkViewProperty.value ) && tickMarkRangeProperty.value === tickMarkRangeProperty.initialValue ) {
        const tickMarkStep = 1 / tickMarkRangeProperty.value;

        // iterate through model values of each tick mark
        for ( let i = valueRange.min; i < valueRange.max; i += tickMarkStep ) {
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

    // Only the RatioHalf DragListener allows for horizontal movement, so support that here.
    const positionProperty = new DynamicProperty( new Property( valueProperty ), {
      reentrant: true,
      bidirectional: true,
      valueType: Vector2,
      inverseMap: vector2 => vector2.y,
      map: number => {

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
    let startingX = null;

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      tandem: options.tandem.createTandem( 'dragListener' ),
      dragBoundsProperty: dragBoundsProperty,
      start: () => {
        if ( horizontalMovementAllowedProperty.value ) {
          startingX = positionProperty.value.x;
        }
        viewSounds.grabSoundClip.play();
        cueArrowsState.interactedWithMouseProperty.value = true;

        inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( true );
        viewSounds.boundarySoundClip.onStartInteraction();
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
        inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( false );
        viewSounds.boundarySoundClip.onEndInteraction( positionProperty.value.y );

        // Support context response on interaction end from mouse/touch input.
        this.ratioHandNode.alertContextResponse();
      }
    } );

    // When the range changes, update the dragBounds of the drag listener
    enabledRatioTermsRangeProperty.link( enabledRange => {
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
        cueArrowsState.keyboardFocusedProperty.value = true;
        viewSounds.grabSoundClip.play();
      },
      blur: () => {
        cueArrowsState.keyboardFocusedProperty.value = false;
        viewSounds.releaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      }
    } );

    this.mutate( options );

    const updatePointer = position => {
      this.ratioHandNode.translation = modelViewTransform.modelToViewPosition( position );
    };
    positionProperty.link( updatePointer );

    // @private
    this.layoutRatioHalf = ( newBounds, heightScalar ) => {
      this.rectWidth = newBounds.width;
      this.rectHeight = newBounds.height;

      this.framingRectangleHeight = topRect.rectHeight = bottomRect.rectHeight = heightScalar * MIN_FRAMING_RECTANGLE_HEIGHT + ( MAX_FRAMING_RECTANGLE_HEIGHT - MIN_FRAMING_RECTANGLE_HEIGHT );

      // Scale depending on how tall the ratio half is. This is to support narrow and tall layouts where the hand needs
      // to be scaled up more to support touch interaction, see https://github.com/phetsims/ratio-and-proportion/issues/217.
      const handScale = heightScalar * ( MAX_HAND_SCALE - MIN_HAND_SCALE ) + MIN_HAND_SCALE;
      this.ratioHandNode.setScaleMagnitude( handScale );

      const framingRectWidth = newBounds.width - newBounds.width * .1;
      topRect.rectWidth = framingRectWidth;
      topRect.centerX = bottomRect.centerX = newBounds.centerX;
      bottomRect.rectWidth = framingRectWidth;
      topRect.top = 0;
      bottomRect.bottom = newBounds.height;

      const boundsNoFramingRects = newBounds.erodedY( this.framingRectangleHeight );

      // Don't count the space the framing rectangles take up as part of the draggableArea.
      modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        getModelBoundsFromRange( valueRange ),
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
  getSingleHandContextResponse() {

    // When locked, give a description of both-hands, instead of just a single one.
    if ( this.ratioLockedProperty.value ) {
      return this.bothHandsDescriber.getBothHandsContextResponse();
    }

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse, {
      distance: this.handPositionsDescriber.getSingleHandDistance( this.valueProperty ),
      position: this.handPositionsDescriber.getHandPositionDescription( this.valueProperty.value, this.tickMarkViewProperty.value, false )
    } );
  }

  /**
   * The bottom of the Rectangle that contains the RatioHandNode is not the complete bounds of the Node. With that in
   * mind, offset the bottom by the height that extends beyond the Rectangle. For example, the cue arrows of the RatioHandNode can extend beyond the
   * "ratio half box" (the draggable area).
   * @public
   * @param {number} desiredBottom
   */
  setBottomOfRatioHalf( desiredBottom ) {

    // `selfBounds` is used for the position of the Rectangle, since RatioHalf extends Rectangle
    this.bottom = desiredBottom + ( this.bounds.bottom - this.localToParentBounds( this.selfBounds ).bottom );
  }

  /**
   * @public
   * @param {Bounds2} bounds - the bounds of this RatioHalf, effects dimensions, dragBounds, and width of guiding rectangles
   * @param {number} heightScalar - normalized between 0 and 1. When 1, it the ratio half will be the tallest it gets, at 0, the shortest
   */
  layout( bounds, heightScalar ) {
    assert && assert( heightScalar >= 0 && heightScalar <= 1, 'scalar should be between 0 and 1' );
    this.layoutRatioHalf( bounds, heightScalar );
  }

  /**
   * @public
   */
  reset() {
    this.resetRatioHalf();
  }
}

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;