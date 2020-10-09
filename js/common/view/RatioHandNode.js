// Copyright 2020, University of Colorado Boulder

/**
 * Pointer that marks the location of half of the ratio
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import TickMarkView from './TickMarkView.js';

// constants
const HAND_PATH_SCALE = 2;

class RatioHandNode extends Node {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Range} enabledRatioComponentsRangeProperty
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {number} keyboardStep
   * @param {Property.<ColorDef>} colorProperty - controls the color of the hand. This is for both the filled in and cut out hands.
   * @param {Object} [options]
   */
  constructor( valueProperty, enabledRatioComponentsRangeProperty, tickMarkViewProperty, keyboardStep, colorProperty, options ) {

    options = merge( {
      cursor: 'pointer',
      isRight: true, // right hand or left hand
      asIcon: false, // when true, no input will be attached

      ariaOrientation: Orientation.VERTICAL,
      keyboardStep: keyboardStep,
      shiftKeyboardStep: keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER,
      pageKeyboardStep: 1 / 5
    }, options );
    super();

    // Always the same range, always enabled
    !options.asIcon && this.initializeAccessibleSlider( valueProperty, enabledRatioComponentsRangeProperty, new BooleanProperty( true ), options );

    // @private
    const filledInHandNode = new FilledInHandPath( {
      fill: colorProperty
    } );
    const cutOutHandNode = new CutOutHandPath( {
      visible: false,
      fill: colorProperty
    } );

    const container = new Node( {
      children: [ filledInHandNode, cutOutHandNode ],
      excludeInvisibleChildrenFromBounds: true
    } );
    this.addChild( container );

    // empirical multipliers to center hand on palm. Don't change these without altering the layout for the cue arrows too.
    container.right = container.width * .365;
    container.bottom = container.height * .54;

    // Only display the "target circles" when the tick marks are being shown
    tickMarkViewProperty.link( tickMarkView => {
      const displayCutOut = TickMarkView.displayHorizontal( tickMarkView );
      cutOutHandNode.visible = displayCutOut;
      filledInHandNode.visible = !displayCutOut;
    } );

    // Flip the hand if it isn't a right hand. Do this after the circle/hand relative positioning
    this.setScaleMagnitude( ( options.isRight ? 1 : -1 ) * .4, .4 );

    this.mutate( options );

    // touchArea dilation
    this.touchArea = this.localBounds.dilatedXY( this.width * 2, this.height * 2 );
  }

  /**
   * @param {boolean} isRight
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Object} [options]
   * @returns {Node}
   * @public
   */
  static createIcon( isRight, tickMarkViewProperty, options ) {
    return new Node( {
      children: [ new RatioHandNode( new Property( 0 ), new Range( 0, 1 ), tickMarkViewProperty, new Property( 10 ), new Property( 'black' ), merge( {
        isRight: isRight,
        asIcon: true,
        pickable: false
      }, options ) ) ]
    } );
  }
}

class FilledInHandPath extends Path {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      stroke: 'black',
      scale: HAND_PATH_SCALE
    }, options );

    const shape = `M27.654,1.738c-0.716-0.716-1.572-1.075-2.57-1.075c-1,0-1.856,0.359-2.572,1.075c-0.717,0.717-1.074,1.573-1.074,2.571
v21.354h-1.041V8.477c0-0.998-0.359-1.856-1.075-2.572c-0.717-0.715-1.573-1.073-2.571-1.073c-0.999,0-1.856,0.358-2.572,1.073
c-0.715,0.717-1.073,1.574-1.073,2.572v17.188v8.334l-5.013-6.674c-0.825-1.106-1.933-1.66-3.321-1.66
c-1.15,0-2.132,0.406-2.945,1.221c-0.814,0.813-1.222,1.796-1.222,2.945c0,0.934,0.282,1.769,0.847,2.507l12.5,16.667
c0.825,1.107,2.96,3.442,6.249,4.425c7.18,2.147,11.243,1.665,15.685,0.211c3.871-1.267,4.833-2.464,6.875-5.514
c1.932-2.887,2.112-9.526,2.475-13.186c0.069-0.698,0.162-1.334,0.162-1.92v-16.21c0-0.998-0.358-1.856-1.073-2.572
c-0.717-0.717-1.574-1.073-2.572-1.073c-0.998,0-1.855,0.357-2.571,1.073c-0.717,0.716-1.075,1.574-1.075,2.572v8.854h-1.042V8.477
c0-0.998-0.356-1.856-1.073-2.572c-0.717-0.715-1.574-1.073-2.572-1.073c-0.998,0-1.854,0.358-2.571,1.073
c-0.716,0.717-1.074,1.574-1.074,2.572v17.188h-1.041V4.31C28.729,3.311,28.371,2.455,27.654,1.738z`;

    super( shape, options );
  }
}

class CutOutHandPath extends Path {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      stroke: 'black',
      scale: HAND_PATH_SCALE
    }, options );

    const shape = `M44.323,14.238c-0.717-0.717-1.574-1.073-2.572-1.073s-1.855,0.357-2.571,1.073c-0.717,0.716-1.075,1.574-1.075,2.572v8.854
h-1.042V8.477c0-0.998-0.356-1.856-1.073-2.573c-0.717-0.715-1.574-1.073-2.572-1.073s-1.854,0.358-2.571,1.073
c-0.716,0.717-1.074,1.574-1.074,2.573v12.239c2.514,0.263,4.481,2.364,4.481,4.948c0,2.761-2.239,5-5,5s-5-2.239-5-5
c0-2.583,1.965-4.683,4.477-4.948V4.31c0-0.998-0.358-1.854-1.075-2.571c-0.716-0.716-1.572-1.075-2.57-1.075
c-1,0-1.856,0.359-2.572,1.075c-0.717,0.717-1.074,1.573-1.074,2.571v21.354h-1.041V8.477c0-0.998-0.359-1.856-1.075-2.573
c-0.717-0.715-1.573-1.073-2.571-1.073c-0.999,0-1.855,0.358-2.572,1.073c-0.715,0.717-1.073,1.574-1.073,2.573v17.188v8.334
l-5.013-6.674c-0.825-1.106-1.933-1.66-3.321-1.66c-1.15,0-2.132,0.406-2.946,1.221c-0.814,0.813-1.221,1.796-1.221,2.945
c0,0.934,0.282,1.769,0.846,2.507l12.5,16.667c0.825,1.107,2.96,3.442,6.249,4.425c7.18,2.147,11.243,1.665,15.685,0.211
c3.871-1.267,4.833-2.463,6.875-5.514c1.932-2.887,2.112-9.526,2.475-13.186c0.069-0.698,0.162-1.334,0.162-1.92v-16.21
C45.396,15.812,45.038,14.954,44.323,14.238z`;

    super( shape, options );
  }
}

AccessibleSlider.mixInto( RatioHandNode );

ratioAndProportion.register( 'RatioHandNode', RatioHandNode );
export default RatioHandNode;