// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Range from '../../../../dot/js/Range.js';
import Util from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import proportion from '../../proportion.js';
import Node from '../../../../scenery/js/nodes/Node.js';

class DraggableBar extends Node {

  /**
   * @param {NumberProperty} valueProperty - must have a `range` attribute
   * @param {Property.<PaintDef>} colorProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, colorProperty, options ) {

    options = merge( {
      barWidth: 100,
      barHeight: 550,
      tandem: Tandem.OPTIONAL
    }, options );

    assert && assert( valueProperty.range instanceof Range );

    super();

    this.container = new Rectangle( 0, 0, options.barWidth, options.barHeight, 0, 0, {
      stroke: 'black'
    } );

    this.valueRectangle = new Rectangle( 0, 0, options.barWidth, 0, 0, 0 );

    valueProperty.link( () => {
      const normalizedValue = valueProperty.range.getNormalizedValue( valueProperty.value );
      this.valueRectangle.rectHeight = normalizedValue * options.barHeight; //always 1 px of height
    } );
    colorProperty.link( color => this.valueRectangle.setFill( color ) );

    let offset = null;
    const dragListener = new DragListener( {
      start: () => {
        offset = this.valueRectangle.height;
      },
      drag: ( event, listener ) => {
        const y = listener.parentPoint.y;

        const newValue = Util.clamp( y + offset, 0, options.barHeight );

        valueProperty.value = newValue / options.barHeight;
      },
      tandem: options.tandem.createTandem( 'dragListener' )
    } );

    this.valueRectangle.addInputListener( dragListener );

    this.addChild( new Node( { rotation: Math.PI, children: [ this.container, this.valueRectangle ] } ) );
    this.mutate( options );
  }
}

proportion.register( 'DraggableBar', DraggableBar );
export default DraggableBar;