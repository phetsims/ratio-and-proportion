// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann
 */

import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
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
      barHeight: 550
    }, options );

    assert && assert( valueProperty.range instanceof Range );

    super();

    this.container = new Rectangle( 0, 0, options.barWidth, options.barHeight, {
      stroke: 'black'
    } );

    this.valueRectangle = new Rectangle( 0, 0, options.barWidth, 0, 0, 0 );

    valueProperty.link( () => {
      const normalizedValue = valueProperty.range.getNormalizedValue( valueProperty.value );
      this.valueRectangle.rectHeight = normalizedValue * options.barHeight; //always 1 px of height
    } );
    colorProperty.link( color => this.valueRectangle.setFill( color ) );

    this.addChild( new Node( { rotation: Math.PI, children: [ this.container, this.valueRectangle ] } ) );
    this.mutate( options );
  }
}

proportion.register( 'DraggableBar', DraggableBar );
export default DraggableBar;