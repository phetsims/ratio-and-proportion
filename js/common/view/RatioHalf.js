// Copyright 2020, University of Colorado Boulder

/**
 * A single controllable half of the proportion. It contains a draggable pointer that can change the value of this half
 * of the proportion.
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
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import sliderBoundaryClickSound from '../../../../tambo/sounds/general-boundary-boop_mp3.js';
import sliderClickSound from '../../../../tambo/sounds/general-soft-click_mp3.js';
import commonGrabSound from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSound from '../../../../tambo/sounds/release_mp3.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import designingProperties from '../designingProperties.js';
import RatioHalfAlertManager from './RatioHalfAlertManager.js';
import RatioHalfTickMarksNode from './RatioHalfTickMarksNode.js';
import RatioHandNode from './RatioHandNode.js';
import TickMarkView from './TickMarkView.js';

// contants
const FRAMING_RECTANGLE_HEIGHT = 16;

// This value was calculated based on the design of snapping within the range of the ratio hand center circle, see https://github.com/phetsims/ratio-and-proportion/issues/122#issuecomment-672281015
const SNAP_TO_TICK_MARK_THRESHOLD = .135842179584 / 2;

// TODO: copied from WaveInterferenceSlider
const MIN_INTER_CLICK_TIME = ( 1 / 60 * 1000 ) * 2; // min time between clicks, in milliseconds, empirically determined

// total horizontal drag distance;
const X_MODEL_DRAG_DISTANCE = 1;
const INITIAL_X_VALUE = 0;
const getModelBoundsFromRange = range => new Bounds2( -1 * X_MODEL_DRAG_DISTANCE / 2, range.min, X_MODEL_DRAG_DISTANCE / 2, range.max );

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
   * @param {Property.<Range>} enabledValueRangeProperty - the current range that the hand can move
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {Bounds2} bounds - the area that the node takes up
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Property.<Color>} colorProperty
   * @param {number} keyboardStep
   * @param {BooleanProperty} horizontalMovementAllowedProperty
   * @param {BooleanProperty} playTickMarkBumpSoundProperty
   * @param {InProportionSoundGenerator} inProportionSoundGenerator
   * @param {Object} [options]
   */
  constructor( valueProperty, valueRange, enabledValueRangeProperty, firstInteractionProperty, bounds, tickMarkViewProperty,
               tickMarkRangeProperty, ratioDescriber, handPositionsDescriber, colorProperty, keyboardStep,
               horizontalMovementAllowedProperty, playTickMarkBumpSoundProperty, inProportionSoundGenerator,
               options ) {

    options = merge( {
      isRight: true, // right ratio or the left ratio
      tandem: Tandem.OPTIONAL,

      // AccessibleValueHandler via RatioHandNode
      a11yDependencies: [],

      // pdom
      tagName: 'div',
      accessibleNameBehavior: ratioHalfAccessibleNameBehavior
    }, options );

    super( 0, 0, bounds.width, bounds.height );

    // @public (read-only) - this behaves a bit differently depending on modality. For mouse/touch, any time you are
    // dragging this will be considered interaction, for keyboard, you must press a key before the interaction starts.
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // "Framing" rectangles on the top and bottom of the drag area of the ratio half
    const topRect = new Rectangle( 0, 0, 10, FRAMING_RECTANGLE_HEIGHT, { fill: colorProperty } );
    this.addChild( topRect );
    const bottomRect = new Rectangle( 0, 0, 10, FRAMING_RECTANGLE_HEIGHT, { fill: colorProperty } );
    this.addChild( bottomRect );

    // @private
    this.enabledValueRangeProperty = enabledValueRangeProperty;

    const alertManager = new RatioHalfAlertManager( valueProperty, ratioDescriber, handPositionsDescriber );

    const tickMarksNode = new RatioHalfTickMarksNode( tickMarkViewProperty, tickMarkRangeProperty,
      bounds.width, bounds.height - 2 * FRAMING_RECTANGLE_HEIGHT,
      colorProperty );
    this.addChild( tickMarksNode );

    // @private - The draggable element inside the Node framed with thick rectangles on the top and bottom.
    this.ratioHandNode = new RatioHandNode( valueProperty, enabledValueRangeProperty, tickMarkViewProperty, keyboardStep, {
      startDrag: () => {
        firstInteractionProperty.value = false;
        this.isBeingInteractedWithProperty.value = true;
      },
      isRight: options.isRight,
      a11yCreateAriaValueText: () => handPositionsDescriber.getHandPosition( valueProperty, tickMarkViewProperty.value ),
      endDrag: () => alertManager.alertRatioChange(),
      a11yDependencies: options.a11yDependencies
    } );
    this.addChild( this.ratioHandNode );

    const addSoundOptions = { categoryName: 'user-interface' };
    const soundClipOptions = {
      initialOutputLevel: 0.15,
      enableControlProperties: [ designingProperties.ratioUISoundsEnabledProperty ]
    };
    const commonGrabSoundClip = new SoundClip( commonGrabSound, soundClipOptions );
    const commonReleaseSoundClip = new SoundClip( commonReleaseSound, soundClipOptions );
    soundManager.addSoundGenerator( commonGrabSoundClip, addSoundOptions );
    soundManager.addSoundGenerator( commonReleaseSoundClip, addSoundOptions );

    const tickMarksDisplayedProperty = new DerivedProperty( [ tickMarkViewProperty ], tickMarkView => tickMarkView !== TickMarkView.NONE );
    const tickMarkBumpSoundClip = new SoundClip( sliderClickSound, merge( {}, soundClipOptions, {
      enableControlProperties: soundClipOptions.enableControlProperties.concat( [ tickMarksDisplayedProperty, playTickMarkBumpSoundProperty ] )
    } ) );

    soundManager.addSoundGenerator( tickMarkBumpSoundClip, merge( {
      sonificationLevel: SoundLevelEnum.ENHANCED
    }, addSoundOptions ) );

    const boundaryClickSoundClip = new SoundClip( sliderBoundaryClickSound, soundClipOptions );
    soundManager.addSoundGenerator( boundaryClickSoundClip, addSoundOptions );

    // Keep track of the previous value on slider drag for playing sounds
    let lastValue = valueProperty.value;

    // Keep track of the last time a sound was played so that we don't play too often
    let timeOfLastClick = 0;

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


    const positionVector = new Vector2( INITIAL_X_VALUE, 0 );
    let mappingInitialValue = true;

    // Only the Ratio Half dragging allows for horizontal movement, so support that here.
    const positionProperty = new DynamicProperty( new Property( valueProperty ), {
      reentrant: true,
      bidirectional: true,
      valueType: Vector2,
      inverseMap: vector2 => vector2.y,
      map: number => {

        // initial case
        if ( mappingInitialValue ) {
          mappingInitialValue = false;
          return positionVector.setY( number );
        }
        else {
          return positionProperty.value.copy().setY( number );
        }
      }
    } );

    const dragBoundsProperty = new Property( new Bounds2( 0, 0, 1, 1 ) );

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
        commonGrabSoundClip.play();
        firstInteractionProperty.value = false;

        inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( true );
      },
      drag: () => {
        this.isBeingInteractedWithProperty.value = true;

        if ( typeof startingX === 'number' ) {
          positionProperty.value.setX( startingX );
          positionProperty.notifyListenersStatic();
        }
        const value = valueProperty.value;

        // handle the sound as desired for mouse/touch style input
        for ( let i = 0; i < tickMarkRangeProperty.value; i++ ) {
          const tickValue = ( i / valueRange.getLength() ) / tickMarkRangeProperty.value;
          if ( lastValue !== value && ( value === valueRange.min || value === valueRange.max ) ) {
            boundaryClickSoundClip.play();
            break;
          }
          else if ( lastValue < tickValue && value >= tickValue || lastValue > tickValue && value <= tickValue ) {
            if ( phet.joist.elapsedTime - timeOfLastClick >= MIN_INTER_CLICK_TIME ) {
              tickMarkBumpSoundClip.play();
              timeOfLastClick = phet.joist.elapsedTime;
            }
            break;
          }
        }
        lastValue = value;
      },

      end: () => {

        // snap final value to tick mark if applicable
        const newY = getSnapToTickMarkValue( positionProperty.value.y );
        if ( positionProperty.value.y !== newY ) {
          positionProperty.value.setY( newY );
          positionProperty.notifyListenersStatic();
        }

        startingX = null;
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
        alertManager.alertRatioChange();
        inProportionSoundGenerator.setJumpingOverProportionShouldTriggerSound( false );
      }
    } );

    // When the range changes, update the dragBounds of the drag listener
    enabledValueRangeProperty.link( enabledRange => {
      const newBounds = getModelBoundsFromRange( enabledRange );


      // offset the bounds to account for the ratioHandNode's size, since the center of the ratioHandNode is controlled by the drag bounds.
      const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( this.ratioHandNode.width / 2, -FRAMING_RECTANGLE_HEIGHT );

      // constrain x dimension inside the RatioHalf so that this.ratioHandNode doesn't go beyond the width. Height is constrained
      // via the modelViewTransform.
      dragBoundsProperty.value = newBounds.erodedX( modelHalfPointerPointer.x );
    } );

    this.ratioHandNode.addInputListener( dragListener );
    this.ratioHandNode.addInputListener( {
      focus: () => {
        commonGrabSoundClip.play();
      },
      blur: () => {
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      }
    } );

    const cueArrowOptions = {
      fill: '#FFC000',
      stroke: null,
      opacity: .8,
      headWidth: 40,
      headHeight: 20,
      tailWidth: 20
    };
    const cueArrowUp = new ArrowNode( 0, 0, 0, -40, cueArrowOptions );
    this.addChild( cueArrowUp );

    const cueArrowDown = new ArrowNode( 0, 0, 0, 40, cueArrowOptions );
    this.addChild( cueArrowDown );

    // only display the cues arrows before the first interaction
    firstInteractionProperty.link( isFirstInteraction => {
      cueArrowUp.visible = isFirstInteraction;
      cueArrowDown.visible = isFirstInteraction;
    } );

    this.mutate( options );

    const updatePointer = position => {
      this.ratioHandNode.translation = modelViewTransform.modelToViewPosition( position );

      // recenter cue arrows
      cueArrowUp.bottom = this.ratioHandNode.top - 20;
      cueArrowDown.top = this.ratioHandNode.bottom + 20;

      // This .1 is to offset the centering of the white circle in the Pointer class. Don't change this without changing that.
      cueArrowUp.centerX = cueArrowDown.centerX = this.ratioHandNode.centerX + ( options.isRight ? 1 : -1 ) * this.ratioHandNode.width * .1;
    };
    positionProperty.link( updatePointer );

    // @private
    this.layoutRatioHalf = newBounds => {
      this.rectWidth = newBounds.width;
      this.rectHeight = newBounds.height;

      const framingRectWidth = newBounds.width - newBounds.width * .1;
      topRect.rectWidth = framingRectWidth;
      topRect.centerX = bottomRect.centerX = newBounds.centerX;
      bottomRect.rectWidth = framingRectWidth;
      topRect.top = 0;
      bottomRect.bottom = newBounds.height;

      const boundsNoFramingRects = newBounds.erodedY( FRAMING_RECTANGLE_HEIGHT );

      // Don't count the space the framing rectangles take up as part of the draggableArea.
      modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        getModelBoundsFromRange( this.enabledValueRangeProperty.value ),
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
      alertManager.reset();
      positionProperty.value.setX( INITIAL_X_VALUE );
      positionProperty.notifyListenersStatic();
    };
  }

  /**
   * The bottom of the Rectangle that contains the RatioHandNode is not the complete bounds of the Node. With that in
   * mind, offset the bottom by the height that extends beyond the Rectangle.
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
   */
  layout( bounds ) {
    this.layoutRatioHalf( bounds );
  }

  /**
   * @public
   */
  reset() {
    this.resetRatioHalf();
  }
}

// @public - the height of the top and bottom rectangles
RatioHalf.FRAMING_RECTANGLE_HEIGHT = FRAMING_RECTANGLE_HEIGHT;

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;