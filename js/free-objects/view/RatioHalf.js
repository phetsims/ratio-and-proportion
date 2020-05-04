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
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import KeyboardDragListener from '../../../../scenery/js/listeners/KeyboardDragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import designingProperties from '../../common/designingProperties.js';
import CursorDisplay from '../../common/CursorDisplay.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import commonGrabSoundInfo from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSoundInfo from '../../../../tambo/sounds/release_mp3.js';
import filledInHandImage from '../../../images/filled-in-hand_png.js';
import GridView from './GridView.js';

class RatioHalf extends Rectangle {

  /**
   * @param {Vector2Property} positionProperty
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {Property.<boolean>} ratioHalvesFocusOrHoveredProperty
   * @param {Bounds2} bounds - the area that the node takes up
   * @param {EnumerationProperty.<GridView>} gridViewProperty
   * @param {Object} [options]
   */
  constructor( positionProperty, firstInteractionProperty, ratioHalvesFocusOrHoveredProperty, bounds, gridViewProperty, options ) {

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
    const topRect = new Rectangle( 0, 0, 10, 20, { fill: 'black' } );
    this.addChild( topRect );
    const bottomRect = new Rectangle( 0, 0, 10, 20, { fill: 'black' } );
    this.addChild( bottomRect );

    // hide framing border rectangles when the units are being displayed
    gridViewProperty.link( gridView => {
      topRect.visible = bottomRect.visible = !GridView.displayUnits( gridView );
    } );

    // The draggable element inside the Node framed with thick rectangles on the top and bottom.
    const pointer = new Node( {

      // pdom
      tagName: 'div',
      role: 'application',
      focusable: true
    } );
    this.addChild( pointer );

    const handNode = new Image( filledInHandImage );

    // Flip the hand if it isn't a right hand.
    handNode.setScaleMagnitude( ( options.isRight ? 1 : -1 ) * .4, .4 );
    handNode.right = handNode.width / 2;
    handNode.bottom = handNode.height / 2;

    const circle = new Circle( 20, {
      fill: 'black'
    } );
    circle.center = Vector2.ZERO;

    const cross = new PlusNode( {
      size: new Dimension2( 40, 8 )
    } );
    const crossBackground = Rectangle.bounds( cross.bounds );
    const crossNode = new Node( { children: [ cross, crossBackground ] } );
    crossNode.center = Vector2.ZERO;

    designingProperties.markerDisplayProperty.link( displayType => {
      if ( displayType === CursorDisplay.CIRCLE ) {
        pointer.children = [ circle ];
      }
      else if ( displayType === CursorDisplay.CROSS ) {
        pointer.children = [ crossNode ];
      }
      else if ( displayType === CursorDisplay.HAND ) {
        pointer.children = [ handNode ];
      }
      else {
        assert && assert( false, `unsupported displayType: ${displayType}` );
      }
    } );

    const commonGrabSoundClip = new SoundClip( commonGrabSoundInfo, { initialOutput: .7 } );
    const commonReleaseSoundClip = new SoundClip( commonReleaseSoundInfo, { initialOutput: .7 } );
    soundManager.addSoundGenerator( commonGrabSoundClip );
    soundManager.addSoundGenerator( commonReleaseSoundClip );

    // transform and dragBounds set in layout code below
    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      tandem: options.tandem.createTandem( 'dragListener' ),
      start: () => {
        commonGrabSoundClip.play();
        firstInteractionProperty.value = false;
        this.isBeingInteractedWithProperty.value = true;
      },
      end: () => {
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      }
    } );
    pointer.addInputListener( dragListener );

    // transform and dragBounds set in layout code below
    const keyboardDragListener = new KeyboardDragListener( {
      positionProperty: positionProperty,
      start: () => { firstInteractionProperty.value = false; }
    } );
    pointer.addInputListener( keyboardDragListener );
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

    // logic to support cue arrow visibility
    pointer.addInputListener( {
      focus: () => { ratioHalvesFocusOrHoveredProperty.value = true; },
      blur: () => { ratioHalvesFocusOrHoveredProperty.value = false; },
      enter: () => { ratioHalvesFocusOrHoveredProperty.value = true; },
      exit: () => { ratioHalvesFocusOrHoveredProperty.value = false; }
    } );

    const cueArrowOptions = {
      fill: '#FFC000',
      stroke: null,
      opacity: .8,
      headWidth: 40,
      headHeight: 20,
      tailWidth: 20,
      centerX: pointer.centerX
    };
    const cueArrowUp = new ArrowNode( 0, 0, 0, -40, cueArrowOptions );
    cueArrowUp.bottom = pointer.top - 20;
    this.addChild( cueArrowUp );

    const cueArrowDown = new ArrowNode( 0, 0, 0, 40, cueArrowOptions );
    cueArrowDown.top = pointer.bottom + 20;
    this.addChild( cueArrowDown );

    // only display the cues arrows before the first interaction, and when any ratio half is focused or hovered on.
    Property.multilink( [ ratioHalvesFocusOrHoveredProperty, firstInteractionProperty ],
      ( focusedOrHovered, firstInteraction ) => {
        const visible = focusedOrHovered && firstInteraction;
        cueArrowUp.visible = visible;
        cueArrowDown.visible = visible;
      } );

    this.mutate( options );

    let modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      positionProperty.validBounds,
      bounds );

    positionProperty.link( position => {
      pointer.translation = modelViewTransform.modelToViewPosition( position );
    } );

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

      modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
        positionProperty.validBounds,
        newBounds );

      pointer.translation = modelViewTransform.modelToViewPosition( positionProperty.value );

      // offset the bounds to account for the pointer's size, since the center of the pointer is controlled by the drag bounds.
      const modelHalfPointerPointer = modelViewTransform.viewToModelDeltaXY( pointer.width / 2, -pointer.height / 2 );
      const dragBounds = positionProperty.validBounds.erodedXY( modelHalfPointerPointer.x, modelHalfPointerPointer.y );

      dragListener.dragBounds = dragBounds;
      dragListener.transform = modelViewTransform;
      keyboardDragListener.dragBounds = dragBounds;
      keyboardDragListener.transform = modelViewTransform;
    };
  }

  /**
   * @public
   * @param {Bounds2} bounds - the bounds of this RatioHalf, effects dimensions, dragBounds, and width of guiding rectangles
   */
  layout( bounds ) {
    this.layoutRatioHalf( bounds );
  }
}

ratioAndProportion.register( 'DraggableMarker', RatioHalf );
export default RatioHalf;