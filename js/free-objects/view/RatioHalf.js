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
import MarkerDisplay from '../model/MarkerDisplay.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import commonGrabSoundInfo from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSoundInfo from '../../../../tambo/sounds/release_mp3.js';
import filledInHandImage from '../../../images/filled-in-hand_png.js';

class RatioHalf extends Rectangle {

  /**
   * @param {Vector2Property} positionProperty
   * @param {Property.<MarkerDisplay>} markerDisplayProperty
   * @param {Property.<boolean>>} firstInteractionProperty - upon successful interaction, this will be marked as true
   * @param {Bounds2} bounds - the area that the node takes up
   * * @param {Object} [options]
   */
  constructor( positionProperty, markerDisplayProperty, firstInteractionProperty, bounds, options ) {

    options = merge( {
      cursor: 'pointer',
      tandem: Tandem.OPTIONAL
    }, options );

    super( 0, 0, bounds.width, bounds.height );

    // @public (read-only)
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( bounds.centerX, bounds.bottom ),
      bounds.height
    );

    const topRect = new Rectangle( 0, 0, bounds.width - bounds.width * .1, 20, { fill: 'black', centerX: bounds.centerX } );
    this.addChild( topRect );
    const bottomRect = new Rectangle( 0, 0, bounds.width - bounds.width * .1, 20, { fill: 'black', centerX: bounds.centerX } );
    this.addChild( bottomRect );
    topRect.top = 0;
    topRect.centerX = bottomRect.centerX = this.centerX;
    bottomRect.bottom = bounds.height;

    // The draggable element inside the Node framed with thick rectangles on the top and bottom.
    const pointer = new Node( {

      // pdom
      tagName: 'div',
      role: 'application',
      focusable: true
    } );

    const handNode = new Image( filledInHandImage, {scale: .4} );
    handNode.center = Vector2.ZERO;

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

    markerDisplayProperty.link( displayType => {
      if ( displayType === MarkerDisplay.CIRCLE ) {
        pointer.children = [ circle ];
      }
      else if ( displayType === MarkerDisplay.CROSS ) {
        pointer.children = [ crossNode ];
      }
      else if ( displayType === MarkerDisplay.HAND ) {
        pointer.children = [ handNode ];
      }
      else {
        assert && assert( false, `unsupported displayType: ${displayType}` );
      }
    } );

    positionProperty.link( position => {
      pointer.translation = modelViewTransform.modelToViewPosition( position );
    } );

    const commonGrabSoundClip = new SoundClip( commonGrabSoundInfo, { initialOutput: .7 } );
    const commonReleaseSoundClip = new SoundClip( commonReleaseSoundInfo, { initialOutput: .7 } );
    soundManager.addSoundGenerator( commonGrabSoundClip );
    soundManager.addSoundGenerator( commonReleaseSoundClip );

    pointer.addInputListener( new DragListener( {
      positionProperty: positionProperty,
      transform: modelViewTransform,
      dragBoundsProperty: new Property( modelViewTransform.viewToModelBounds( bounds ) ),
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
    } ) );

    pointer.addInputListener( new KeyboardDragListener( {
      positionProperty: positionProperty,
      transform: modelViewTransform,
      start: () => {
        firstInteractionProperty.value = false;
      }
    } ) );
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

    this.addChild( pointer );

    const cueArrowUp = new ArrowNode( 0, 0, 0, -60, {
      fill: '#FFC000',
      headWidth: 40,
      headHeight: 20,
      tailWidth: 20,
      centerX: pointer.centerX,
      bottom: pointer.top - 20
    } );
    firstInteractionProperty.linkAttribute( cueArrowUp, 'visible' );
    this.addChild( cueArrowUp );

    const cueArrowDown = new ArrowNode( 0, 0, 0, 60, {
      fill: '#FFC000',
      headWidth: 40,
      headHeight: 20,
      tailWidth: 20,
      centerX: pointer.centerX,
      top: pointer.bottom + 20
    } );
    firstInteractionProperty.linkAttribute( cueArrowDown, 'visible' );
    this.addChild( cueArrowDown );

    this.mutate( options );
  }
}

ratioAndProportion.register( 'DraggableMarker', RatioHalf );
export default RatioHalf;