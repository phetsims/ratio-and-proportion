// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import proportion from '../../proportion.js';
import Node from '../../../../scenery/js/nodes/Node.js';

class DraggableMarker extends Node {

  /**
   * @param {Vector2Property} positionProperty
   * @param {Property.<boolean>>} firstInteractionProperty - upon successful interaction, this will be marked as true
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} dragBounds
   * @param {Object} [options]
   */
  constructor( positionProperty, firstInteractionProperty, modelViewTransform, dragBounds, options ) {

    options = merge( {
      tandem: Tandem.OPTIONAL
    }, options );

    super();

    const circle = new Circle( 20, {
      cursor: 'pointer',
      tagName: 'div',
      fill: 'black',
      role: 'application',
      focusable: true
    } );

    this.addChild( circle );

    positionProperty.link( position => {
      this.translation = modelViewTransform.modelToViewPosition( position );
    } );

    const dragListener = new DragListener( {
      positionProperty: positionProperty,
      transform: modelViewTransform,
      dragBoundsProperty: new Property( modelViewTransform.viewToModelBounds( dragBounds ) ),
      tandem: options.tandem.createTandem( 'dragListener' )
    } );
    this.addInputListener( dragListener );

    // TODO: keyboard interaction
    // marker.addInputListener( new KeyboardDragListener( {
    //   start() {
    //     firstInteractionProperty.value = false;
    //   },
    //   drag( viewDelta ) {
    //
    //     const currentPosition = marker.height;
    //
    //
    //     // let the smallest height be greater than 0
    //     const newValue = Util.clamp( -viewDelta.y + currentPosition, .1 * options.barHeight, options.barHeight );
    //
    //     valueProperty.value = newValue / options.barHeight;
    //   }
    // } ) );

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

    this.mutate( options );
  }
}

proportion.register( 'DraggableMarker', DraggableMarker );
export default DraggableMarker;