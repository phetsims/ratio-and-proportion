// Copyright 2020-2021, University of Colorado Boulder

/**
 * Sim specific grid implementation that supports customization through passed in Properties. This uses minor lines
 * from GridNode, but not major lines. In Ration and Proportion, these grid lines are called "tick marks"
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import GridNode from '../../../../griddle/js/GridNode.js';
import merge from '../../../../phet-core/js/merge.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import TickMarkView from './TickMarkView.js';
import { Color } from '../../../../scenery/js/imports.js';
import RichEnumerationProperty from '../../../../axon/js/RichEnumerationProperty.js';

class RatioHalfTickMarksNode extends GridNode {

  private tickMarkViewProperty: RichEnumerationProperty<TickMarkView>;
  private tickMarkRangeProperty: Property<number>;

  /**
   * @param tickMarkViewProperty
   * @param tickMarkRangeProperty
   * @param width
   * @param height
   * @param colorProperty
   * @param [options]
   */
  constructor( tickMarkViewProperty: RichEnumerationProperty<TickMarkView>, tickMarkRangeProperty: Property<number>, width: number,
               height: number, colorProperty: Property<Color>, options?: object ) {
    options = merge( {

      // initial line spacings
      minorHorizontalLineSpacing: 10,
      minorLineOptions: {
        stroke: colorProperty,
        lineWidth: 2
      }
    }, options );

    super( width, height, options );

    // @private
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;

    Property.multilink<any[]>( [ tickMarkRangeProperty, tickMarkViewProperty ], this.update.bind( this ) );
  }

  /**
   * @public
   */
  layout( width: number, height: number ): void {
    this.setGridWidth( width );
    this.setGridHeight( height );
    this.update( this.tickMarkRangeProperty.value, this.tickMarkViewProperty.value );
  }

  /**
   * @private
   */
  update( tickMarkRange: number, tickMarkView: TickMarkView ): void {

    // subtract one to account for potential rounding errors. This helps guarantee that the last line is drawn.
    this.setLineSpacings( {
      minorHorizontalLineSpacing: ( this.gridHeight - 1 ) / tickMarkRange
    } );

    this.visible = TickMarkView.displayHorizontal( tickMarkView );
  }
}

ratioAndProportion.register( 'RatioHalfTickMarksNode', RatioHalfTickMarksNode );
export default RatioHalfTickMarksNode;