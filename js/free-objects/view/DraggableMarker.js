// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import KeyboardDragListener from '../../../../scenery/js/listeners/KeyboardDragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import proportion from '../../proportion.js';
import MarkerDisplay from '../model/MarkerDisplay.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import commonGrabSoundInfo from '../../../../tambo/sounds/grab_mp3.js';
import commonReleaseSoundInfo from '../../../../tambo/sounds/release_mp3.js';

class DraggableMarker extends Node {

  /**
   * @param {Vector2Property} positionProperty
   * @param {Property.<MarkerDisplay>} markerDisplayProperty
   * @param {Property.<boolean>>} firstInteractionProperty - upon successful interaction, this will be marked as true
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} dragBounds
   * @param {Object} [options]
   */
  constructor( positionProperty, markerDisplayProperty, firstInteractionProperty, modelViewTransform, dragBounds, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL
    }, options );

    super( {
      cursor: 'pointer',
      tagName: 'div',
      role: 'application',
      focusable: true
    } );

    // @public (read-only)
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    const content = new Node();

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
        content.children = [ circle ];
      }
      else if ( displayType === MarkerDisplay.CROSS ) {
        content.children = [ crossNode ];
      }
      else {
        assert && assert( false, `unsupported displayType: ${displayType}` );
      }
    } );

    positionProperty.link( position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    } );

    const commonGrabSoundClip = new SoundClip( commonGrabSoundInfo, { initialOutput: .7 } );
    const commonReleaseSoundClip = new SoundClip( commonReleaseSoundInfo, { initialOutput: .7 } );
    soundManager.addSoundGenerator( commonGrabSoundClip );
    soundManager.addSoundGenerator( commonReleaseSoundClip );

    this.addInputListener( new DragListener( {
      positionProperty: positionProperty,
      transform: modelViewTransform,
      dragBoundsProperty: new Property( modelViewTransform.viewToModelBounds( dragBounds ) ),
      tandem: options.tandem.createTandem( 'dragListener' ),
      start: () => {
        commonGrabSoundClip.play();
        this.isBeingInteractedWithProperty.value = true;
      },
      end: () => {
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      }
    } ) );

    this.addInputListener( new KeyboardDragListener( {
      positionProperty: positionProperty,
      transform: modelViewTransform
    } ) );
    this.addInputListener( {
      focus: () => {
        commonGrabSoundClip.play();
        this.isBeingInteractedWithProperty.value = true;
      },
      blur: () => {
        commonReleaseSoundClip.play();
        this.isBeingInteractedWithProperty.value = false;
      }
    } );

    // TODO: cue arrows
    // const cueArrow = new ArrowNode( 0, 40, 0, -40, {
    //   doubleHead: true,
    //   fill: '#FFC000',
    //   headWidth: 40,
    //   headHeight: 20,
    //   tailWidth: 20,
    //   center: new Vector2( marker.centerX, marker.height )
    // } );
    // firstInteractionProperty.linkAttribute( cueArrow, 'visible' );

    this.addChild( content );
    this.mutate( options );
  }
}

proportion.register( 'DraggableMarker', DraggableMarker );
export default DraggableMarker;