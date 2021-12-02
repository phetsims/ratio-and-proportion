// Copyright 2021, University of Colorado Boulder

/**
 * Graphic to display the qualitative positional regions used for describing the position of the hands in each ratio half.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import { Line, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import HandPositionsDescriber from './describers/HandPositionsDescriber.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

class RAPPositionRegionsLayer extends Node {

  private totalWidth: number;
  private totalHeight: number;
  public labelsHeight: number;
  private regions: number[];

  constructor( options?: NodeOptions ) {

    super( options );

    // Temp values to start, updated on layout()
    this.totalWidth = 1000;
    this.totalHeight = 1000;
    this.labelsHeight = 1000;

    // These values are duplicated with HandPositionDescriber, do not change without consulting.
    this.regions = [ 1, 1, 0.9, 0.65, 0.5, 0.5, 0.35, 0.1, 0, 0 ];
  }

  public layout( width: number, height: number ): void {

    this.totalHeight = height;
    this.totalWidth = width;
    this.update();
  }

  private update(): void {
    this.children = [];

    for ( let i = 0; i < this.regions.length; i++ ) {
      const region = this.regions[ i ];
      const nextRegion = this.regions[ i + 1 ];
      const height = this.totalHeight - ( region * this.totalHeight );
      this.addChild( new Line( 0, height, this.totalWidth, height, { stroke: 'red' } ) );
      if ( nextRegion !== undefined ) {
        const centerOfRange = ( ( this.totalHeight - ( nextRegion * this.totalHeight ) ) - height ) / 2;
        const text = new Text( HandPositionsDescriber.QUALITATIVE_POSITIONS[ i ], {
          centerY: height + centerOfRange,
          centerX: this.totalWidth / 2,
          stroke: 'black',
          font: new PhetFont( 17 )
        } );
        this.labelsHeight = text.height;
        this.addChild( text );
      }
    }
  }
}

ratioAndProportion.register( 'RAPPositionRegionsLayer', RAPPositionRegionsLayer );
export default RAPPositionRegionsLayer;