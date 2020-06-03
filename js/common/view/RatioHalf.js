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
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import commonGrabSound from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSound from '../../../../tambo/sounds/release_mp3.js';
import Tandem from '../../../../tandem/js/Tandem.js';
// TODO: don't depend on wave-interference
import sliderClickSound from '../../../../wave-interference/sounds/slider-clicks-idea-c-example_mp3.js';
import sliderBoundaryClickSound from '../../../../wave-interference/sounds/slider-clicks-idea-c-lower-end-click_mp3.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import designingProperties from '../designingProperties.js';
import FreeObjectAlertManager from './FreeObjectAlertManager.js';
import GridView from './GridView.js';
import RatioHalfGridNode from './RatioHalfGridNode.js';
import RatioHandNode from './RatioHandNode.js';

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
   * @param {Property.<number>} gridBaseUnitProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {GridDescriber} gridDescriber
   * @param {Object} [options]
   */
  constructor( positionProperty, valueProperty, valueRange, firstInteractionProperty, bounds, gridViewProperty, gridBaseUnitProperty, ratioDescriber, gridDescriber, options ) {

    options = merge( {
      cursor: 'ratioHandNode',
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

    const gridNode = new RatioHalfGridNode( gridViewProperty, gridBaseUnitProperty, bounds.width, bounds.height - 2 * FRAMING_RECTANGLE_HEIGHT );
    this.addChild( gridNode );

    // The draggable element inside the Node framed with thick rectangles on the top and bottom.
    const ratioHandNode = new RatioHandNode( valueProperty, valueRange, gridViewProperty, gridBaseUnitProperty, {
      startDrag: () => { firstInteractionProperty.value = false; },
      isRight: options.isRight
    } );
    this.addChild( ratioHandNode );

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

    let modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      positionProperty.validBounds,
      bounds );

    // offset the bounds to account for the ratioHandNode's size, since the center of the ratioHandNode is controlled by the drag bounds.
    const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( ratioHandNode.width / 2, -FRAMING_RECTANGLE_HEIGHT );

    // constrain x dimension inside the RatioHalf so that ratioHandNode doesn't go beyond the width. Height is constrained
    // via the modelViewTransform.
    const dragBounds = positionProperty.validBounds.erodedX( modelHalfPointerPointer.x );

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      tandem: options.tandem.createTandem( 'dragListener' ),
      dragBoundsProperty: new Property( dragBounds ),
      start: () => {
        commonGrabSoundClip.play();
        firstInteractionProperty.value = false;
        this.isBeingInteractedWithProperty.value = true;
      },
      drag: () => {

        const value = valueProperty.value;

        // handle the sound as desired for mouse/touch style input
        for ( let i = 0; i < gridBaseUnitProperty.value; i++ ) {
          const tickValue = ( i / valueRange.getLength() ) / gridBaseUnitProperty.value;
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
    ratioHandNode.addInputListener( dragListener );
    ratioHandNode.addInputListener( {
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

    const updatePointer = position => {
      ratioHandNode.translation = modelViewTransform.modelToViewPosition( position );

      // recenter cue arrows
      cueArrowUp.bottom = ratioHandNode.top - 20;
      cueArrowDown.top = ratioHandNode.bottom + 20;

      // This .1 is to offset the centering of the white circle in the Pointer class. Don't change this without changing that.
      cueArrowUp.centerX = cueArrowDown.centerX = ratioHandNode.centerX + ( options.isRight ? 1 : -1 ) * ratioHandNode.width * .1;
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
        positionProperty.validBounds,
        boundsNoFramingRects );

      updatePointer( positionProperty.value );

      dragListener.transform = modelViewTransform;

      gridNode.layout( boundsNoFramingRects.width, boundsNoFramingRects.height );
      gridNode.bottom = bottomRect.top;
      gridNode.left = 0;
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

ratioAndProportion.register( 'RatioHalf', RatioHalf );
export default RatioHalf;