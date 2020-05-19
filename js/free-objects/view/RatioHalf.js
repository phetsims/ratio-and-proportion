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
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import designingProperties from '../../common/designingProperties.js';
import CursorDisplay from '../../common/CursorDisplay.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import commonGrabSound from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSound from '../../../../tambo/sounds/release_mp3.js';
import filledInHandImage from '../../../images/filled-in-hand_png.js';
import FreeObjectAlertManager from './FreeObjectAlertManager.js';
import GridView from './GridView.js';

// TODO: don't depend on wave-interference
import sliderClickSound from '../../../../wave-interference/sounds/slider-clicks-idea-c-example_mp3.js';
import sliderBoundaryClickSound from '../../../../wave-interference/sounds/slider-clicks-idea-c-lower-end-click_mp3.js';

// contants
const FRAMING_RECTANGLE_HEIGHT = 16;

// TODO: copied from WaveInterferenceSlider
const MIN_INTER_CLICK_TIME = ( 1 / 60 * 1000 ) * 2; // min time between clicks, in milliseconds, empirically determined

class RatioHalf extends Rectangle {

  /**
   * @param {Vector2Property} positionProperty
   * @param {NumberProperty} valueProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {Bounds2} bounds - the area that the node takes up
   * @param {EnumerationProperty.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {GridDescriber} gridDescriber
   * @param {Object} [options]
   */
  constructor( positionProperty, valueProperty, valueRange, firstInteractionProperty, bounds, gridViewProperty, ratioDescriber, gridDescriber, options ) {

    options = merge( {
      cursor: 'pointer',
      isRight: true, // right ratio or the left ratio
      tandem: Tandem.OPTIONAL,

      // pdom
      tagName: 'div',
      labelTagName: 'h3'
    }, options );

    super( 0, 0, bounds.width, bounds.height );

    // @public (read-only)
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // "Framing" rectangles on the top and bottom of the drag area of the ratio half
    const topRect = new Rectangle( 0, 0, 10, FRAMING_RECTANGLE_HEIGHT, { fill: 'black' } );
    this.addChild( topRect );
    const bottomRect = new Rectangle( 0, 0, 10, FRAMING_RECTANGLE_HEIGHT, { fill: 'black' } );
    this.addChild( bottomRect );

    // hide framing border rectangles when the units are being displayed
    gridViewProperty.link( gridView => {
      topRect.visible = bottomRect.visible = gridView === GridView.NONE;
    } );

    // @private
    this.alertManager = new FreeObjectAlertManager( valueProperty, gridViewProperty, ratioDescriber, gridDescriber, options.isRight );

    // The draggable element inside the Node framed with thick rectangles on the top and bottom.
    const pointer = new Pointer( valueProperty, valueRange, {
      startDrag: () => { firstInteractionProperty.value = false; },
      isRight: options.isRight
    } );
    this.addChild( pointer );

    // Sound for the wave slider clicks
    const addSoundOptions = { categoryName: 'user-interface' };
    const soundClipOptions = {
      initialOutputLevel: 0.3, // TODO: I made this louder than waves intro, https://github.com/phetsims/ratio-and-proportion/issues/45
      enableControlProperties: [ designingProperties.ratioUISoundsEnabledProperty ]
    };
    const commonGrabSoundClip = new SoundClip( commonGrabSound, soundClipOptions );
    const commonReleaseSoundClip = new SoundClip( commonReleaseSound, soundClipOptions );
    soundManager.addSoundGenerator( commonGrabSoundClip, addSoundOptions );
    soundManager.addSoundGenerator( commonReleaseSoundClip, addSoundOptions );

    // add sound generators that will play a sound when the value controlled by the slider changes
    const sliderClickSoundClip = new SoundClip( sliderClickSound, merge( soundClipOptions, {
      enableControlProperties: soundClipOptions.enableControlProperties.concat( [ new DerivedProperty( [ gridViewProperty ], gridView => gridView !== GridView.NONE ) ] )
    } ) );
    soundManager.addSoundGenerator( sliderClickSoundClip, addSoundOptions );

    const sliderBoundaryClickSoundClip = new SoundClip( sliderBoundaryClickSound, soundClipOptions );
    soundManager.addSoundGenerator( sliderBoundaryClickSoundClip, addSoundOptions );

    // Keep track of the previous value on slider drag for playing sounds
    let lastValue = valueProperty.value;

    // Keep track of the last time a sound was played so that we don't play too often
    let timeOfLastClick = 0;

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      tandem: options.tandem.createTandem( 'dragListener' ),
      start: () => {
        commonGrabSoundClip.play();
        firstInteractionProperty.value = false;
        this.isBeingInteractedWithProperty.value = true;
      },
      drag: () => {

        const value = valueProperty.value;

        // handle the sound as desired for mouse/touch style input
        for ( let i = 0; i < designingProperties.gridBaseUnitProperty.value; i++ ) {
          const tickValue = ( i / valueRange.getLength() ) / designingProperties.gridBaseUnitProperty.value;
          if ( lastValue !== value && ( value === valueRange.min || value === valueRange.max ) ) {
            sliderBoundaryClickSoundClip.play();
            break;
          }
          else if ( lastValue < tickValue && value >= tickValue || lastValue > tickValue && value <= tickValue ) {
            if ( phet.joist.elapsedTime - timeOfLastClick >= MIN_INTER_CLICK_TIME ) {
              sliderClickSoundClip.play();
              timeOfLastClick = phet.joist.elapsedTime;
            }
            break;
          }
        }
        lastValue = value;
      },

      end: () => {
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
        this.alertManager.dragEndListener( valueProperty.get() );
      }
    } );
    pointer.addInputListener( dragListener );
    pointer.addInputListener( {
      focus: () => {
        commonGrabSoundClip.play();
        this.isBeingInteractedWithProperty.value = true;
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

    let modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      positionProperty.validBounds,
      bounds );

    const recomputeDragBounds = () => {

      // offset the bounds to account for the pointer's size, since the center of the pointer is controlled by the drag bounds.
      const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( pointer.width / 2, -FRAMING_RECTANGLE_HEIGHT );

      // constrain x dimension inside the RatioHalf so that pointer doesn't go beyond the width. Height is constrained
      // via the modelViewTransform.
      const dragBounds = positionProperty.validBounds.erodedX( modelHalfPointerPointer.x );

      dragListener.dragBounds = dragBounds;
    };

    designingProperties.markerDisplayProperty.link( displayType => {
      pointer.updatePointerView( displayType );
      recomputeDragBounds();
    } );

    const updatePointer = position => {
      pointer.translation = modelViewTransform.modelToViewPosition( position );

      // recenter cue arrows
      cueArrowUp.bottom = pointer.top - 20;
      cueArrowDown.top = pointer.bottom + 20;
      cueArrowUp.centerX = cueArrowDown.centerX = pointer.centerX;
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

      // Don't count the space the framing rectangles take up as part of the draggableArea.
      modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        positionProperty.validBounds,
        newBounds.erodedY( FRAMING_RECTANGLE_HEIGHT ) );

      updatePointer( positionProperty.value );

      recomputeDragBounds();
      dragListener.transform = modelViewTransform;
    };
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
    this.alertManager.reset();
  }
}

// @public - the height of the top and bottom rectangles
RatioHalf.FRAMING_RECTANGLE_HEIGHT = FRAMING_RECTANGLE_HEIGHT;

class Pointer extends Node {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Range} valueRange
   * @param {Object} [options]
   */
  constructor( valueProperty, valueRange, options ) {

    options = merge( {
      isRight: true // right hand or left hand
    }, options );
    super();

    // Always the same range, always enabled
    this.initializeAccessibleSlider( valueProperty, new Property( valueRange ), new BooleanProperty( true ), options );

    // @private
    this.handNode = new Image( filledInHandImage );

    // Flip the hand if it isn't a right hand.
    this.handNode.setScaleMagnitude( ( options.isRight ? 1 : -1 ) * .4, .4 );
    this.handNode.right = this.handNode.width / 2;
    this.handNode.bottom = this.handNode.height / 2;

    // @private
    this.circleNode = new Circle( 20, {
      fill: 'black'
    } );
    this.circleNode.center = Vector2.ZERO;

    const cross = new PlusNode( {
      size: new Dimension2( 40, 8 )
    } );
    const crossBackground = Rectangle.bounds( cross.bounds );

    // @private
    this.crossNode = new Node( { children: [ cross, crossBackground ] } );
    this.crossNode.center = Vector2.ZERO;

    designingProperties.gridBaseUnitProperty.link( baseUnit => {
      const downDelta = 1 / baseUnit;
      this.setKeyboardStep( downDelta );
      this.setShiftKeyboardStep( downDelta / 4 );
      this.setPageKeyboardStep( 1 / 5 );
    } );

    this.mutate( options );
  }

  /**
   * @public
   * @param {CursorDisplay} cursorDisplay
   */
  updatePointerView( cursorDisplay ) {
    if ( cursorDisplay === CursorDisplay.CIRCLE ) {
      this.children = [ this.circleNode ];
    }
    else if ( cursorDisplay === CursorDisplay.CROSS ) {
      this.children = [ this.crossNode ];
    }
    else if ( cursorDisplay === CursorDisplay.HAND ) {
      this.children = [ this.handNode ];
    }
    else {
      assert && assert( false, `unsupported cursorDisplay: ${cursorDisplay}` );
    }
  }
}

AccessibleSlider.mixInto( Pointer );

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;