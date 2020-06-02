// Copyright 2020, University of Colorado Boulder

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import Screen from '../../../../joist/js/Screen.js';
import Shape from '../../../../kite/js/Shape.js';
import Random from '../../../../dot/js/Random.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';

// constants
const NUM_SHAPES = 2;
const NUM_SEGMENTS_PER_SHAPE = 5;

class RandomIcon extends Node {

  /**
   * @param {number} seed - seed value for the random number generator
   * @param {String} [caption] - optional caption
   */
  constructor( seed, caption ) {

    super();

    const maxX = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width;
    const maxY = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height;
    this.random = new Random( { seed: seed } );

    // add the background
    const background = new Rectangle( 0, 0, maxX, maxY, 0, 0, {
      fill: this.generateRandomLinearGradient( maxX, maxY )
    } );
    this.addChild( background );

    // set a clip area, since sometimes the random control points can cause the shape to go outside the icon bounds
    background.clipArea = new Shape.rect( 0, 0, maxX, maxY );

    // create the artwork
    _.times( NUM_SHAPES, () => {
      const shape = this.generateRandomShape( NUM_SEGMENTS_PER_SHAPE, maxX, maxY );
      background.addChild( new Path( shape, {
        fill: this.generateRandomLinearGradient( maxX, maxY ),
        stroke: this.generateRandomColor()
      } ) );
    } );

    // add the caption, if specified
    if ( caption ) {
      const captionNode = new Text( caption, {
        fill: 'white',
        stroke: 'black',
        font: new PhetFont( 40 ) // size empirically determined for one character, scaled to fit below
      } );
      const wScale = ( ( background.width * 0.9 ) / captionNode.width );
      const hScale = ( ( background.height * 0.9 ) / captionNode.height );
      captionNode.scale( Math.min( wScale, hScale ) );
      captionNode.centerX = background.width / 2;
      captionNode.centerY = background.height / 2;
      background.addChild( captionNode );
    }
  }

  /**
   * @private, function to generate a random color
   * @returns {Color}
   */
  generateRandomColor() {
    const r = Math.floor( this.random.nextDouble() * 256 );
    const g = Math.floor( this.random.nextDouble() * 256 );
    const b = Math.floor( this.random.nextDouble() * 256 );
    return new Color( r, g, b );
  }

  /**
   * utility function to generate a random linear gradient
   * @param {number} maxX
   * @param {number} maxY
   * @returns {LinearGradient}
   * @private
   */
  generateRandomLinearGradient( maxX, maxY ) {
    const vertical = this.random.nextDouble() > 0.5;
    let gradient;
    if ( vertical ) {
      gradient = new LinearGradient( this.random.nextDouble() * maxX, 0, this.random.nextDouble() * maxX, maxY );
    }
    else {
      gradient = new LinearGradient( 0, this.random.nextDouble() * maxY, maxX, this.random.nextDouble() * maxY );
    }
    gradient.addColorStop( 0, this.generateRandomColor() );
    gradient.addColorStop( 1, this.generateRandomColor() );
    return gradient;
  }

  /**
   * utility function to generate a random point
   * @param {number} maxX
   * @param {number} maxY
   * @returns {Vector2}
   * @private
   */
  generateRandomPoint( maxX, maxY ) {
    return new Vector2( this.random.nextDouble() * maxX, this.random.nextDouble() * maxY );
  }

  /**
   * utility function to generate a random shape segment
   * @param shape
   * @param maxX
   * @param maxY
   * @private
   */
  addRandomSegment( shape, maxX, maxY ) {
    const decider = this.random.nextDouble();
    const endpoint = this.generateRandomPoint( maxX, maxY );
    let controlPoint1;
    let controlPoint2;
    if ( decider < 0.33 ) {

      // add a line segment
      shape.lineToPoint( endpoint );
    }
    else if ( decider < 0.66 ) {

      // add a quadratic curve
      controlPoint1 = this.generateRandomPoint( maxX, maxY );
      shape.quadraticCurveTo( controlPoint1.x, controlPoint1.y, endpoint.x, endpoint.y );
    }
    else {

      // add a cubic curve
      controlPoint1 = this.generateRandomPoint( maxX, maxY );
      controlPoint2 = this.generateRandomPoint( maxX, maxY );
      shape.cubicCurveTo( controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, endpoint.x, endpoint.y );
    }
  }

  /**
   * utility function to generate random shape
   * @param numSegments
   * @param maxX
   * @param maxY
   * @returns {Shape}
   * @private
   */
  generateRandomShape( numSegments, maxX, maxY ) {
    const shape = new Shape();
    shape.moveToPoint( this.generateRandomPoint( maxX, maxY ) );
    for ( let i = 0; i < numSegments; i++ ) {
      this.addRandomSegment( shape, maxX, maxY );
    }
    shape.close();
    return shape;
  }
}

ratioAndProportion.register( 'RandomIcon', RandomIcon );
export default RandomIcon;