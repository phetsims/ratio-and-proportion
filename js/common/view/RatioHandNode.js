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
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import FocusHighlightFromNode from '../../../../scenery/js/accessibility/FocusHighlightFromNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import RAPColorProfile from './RAPColorProfile.js';
import TickMarkView from './TickMarkView.js';

class RatioHandNode extends Node {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Range} enabledRatioComponentsRangeProperty
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {number} keyboardStep
   * @param {Property.<ColorDef>} colorProperty - controls the color of the hand. This is for both the filled in and cut out hands.
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {Object} [options]
   */
  constructor( valueProperty, enabledRatioComponentsRangeProperty, tickMarkViewProperty, keyboardStep, colorProperty, firstInteractionProperty, options ) {

    const shiftKeyboardStep = keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER;

    options = merge( {
      cursor: 'pointer',
      isRight: true, // right hand or left hand
      asIcon: false, // when true, no input will be attached

      ariaOrientation: Orientation.VERTICAL,
      keyboardStep: keyboardStep,
      pageKeyboardStep: 1 / 5,
      shiftKeyboardStep: shiftKeyboardStep,

      // Because this interaction uses the keyboard, snap to the keyboard step to handle the case where the hands were
      // previously moved via mouse/touch. See https://github.com/phetsims/ratio-and-proportion/issues/156
      constrainValue: value => RAPConstants.SNAP_TO_KEYBOARD_STEP( value, this.shiftKeyDown ? shiftKeyboardStep : keyboardStep )
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
      children: [

        // Add a background rectangle to support dragging in the cut out section of the hand.
        Rectangle.bounds( filledInHandNode.bounds.dilated( -filledInHandNode.bounds.width / 6 ) ),
        filledInHandNode,
        cutOutHandNode
      ],
      excludeInvisibleChildrenFromBounds: true
    } );
    this.addChild( container );

    // empirical multipliers to center hand on palm. Don't change these without altering the layout for the cue arrows too.
    container.right = container.width * .365;
    container.bottom = container.height * .54;

    assert && assert( !options.focusHighlight, 'RatioHandNode sets its own focusHighlight' );
    this.focusHighlight = new FocusHighlightFromNode( container );

    // Only display the "target circles" when the tick marks are being shown
    tickMarkViewProperty.link( tickMarkView => {
      const displayCutOut = TickMarkView.displayHorizontal( tickMarkView );
      cutOutHandNode.visible = displayCutOut;
      filledInHandNode.visible = !displayCutOut;
    } );

    const cueArrowOptions = {
      fill: RAPColorProfile.cueArrowsProperty,
      stroke: 'black',
      headWidth: 33.33,
      headHeight: 16.66,
      tailWidth: 16.66
    };
    const cueArrowUp = new ArrowNode( 0, 0, 0, -33.33, merge( {
      bottom: container.top - 20
    }, cueArrowOptions ) );
    const cueArrowDown = new ArrowNode( 0, 0, 0, 33.33, merge( {
      top: container.bottom + 20
    }, cueArrowOptions ) );
    this.addChild( cueArrowUp );
    this.addChild( cueArrowDown );

    // only display the cues arrows before the first interaction
    firstInteractionProperty.link( isFirstInteraction => {
      cueArrowUp.visible = isFirstInteraction;
      cueArrowDown.visible = isFirstInteraction;
    } );

    this.mutate( options );

    // Flip the hand if it isn't a right hand. Do this after the circle/hand relative positioning
    this.scale( ( options.isRight ? 1 : -1 ), 1 );

    // This .1 is to offset the centering of the white circle, it is empirically determined.
    cueArrowUp.centerX = cueArrowDown.centerX = this.centerX + ( options.isRight ? 1 : -1 ) * this.width * .1;

    // touchArea dilation - TODO: why no mouseArea? https://github.com/phetsims/ratio-and-proportion/issues/205
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
    options = merge( {
      handColor: 'black',
      handNodeOptions: {}
    }, options );

    const ratioHandNode = new RatioHandNode(
      new Property( 0 ),
      new Range( 0, 1 ),
      tickMarkViewProperty,
      new Property( 10 ),
      new Property( options.handColor ),
      new Property( false ),
      merge( {
        isRight: isRight,
        asIcon: true,
        pickable: false
      }, options.handNodeOptions ) );

    return new Node( {
      children: [ ratioHandNode ]
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
      lineWidth: 2
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
      lineWidth: 2
    }, options );

    const shape = `M44.323,14.238c-0.717-0.717-1.574-1.073-2.572-1.073s-1.855,0.357-2.571,1.073c-0.717,0.716-1.075,1.574-1.075,2.572v3.138
c-0.31-0.476-0.661-0.921-1.042-1.34V8.477c0-0.998-0.356-1.856-1.073-2.573c-0.717-0.715-1.574-1.073-2.572-1.073
s-1.854,0.358-2.571,1.073c-0.716,0.717-1.074,1.574-1.074,2.573v6.71c-0.155-0.007-0.307-0.023-0.464-0.023
c-0.195,0-0.385,0.019-0.577,0.029V4.31c0-0.998-0.358-1.854-1.075-2.571c-0.716-0.716-1.572-1.075-2.57-1.075
c-1,0-1.856,0.359-2.572,1.075c-0.717,0.717-1.074,1.573-1.074,2.571v14.425c-0.385,0.437-0.732,0.904-1.041,1.4V8.477
c0-0.998-0.359-1.856-1.075-2.573c-0.717-0.715-1.573-1.073-2.571-1.073c-0.999,0-1.855,0.358-2.572,1.073
c-0.715,0.717-1.073,1.574-1.073,2.573v17.188v8.334l-5.013-6.674c-0.825-1.106-1.934-1.66-3.321-1.66
c-1.15,0-2.132,0.406-2.945,1.221c-0.814,0.813-1.222,1.796-1.222,2.945c0,0.934,0.282,1.769,0.847,2.507l12.5,16.667
c0.825,1.107,2.96,3.442,6.249,4.425c7.18,2.147,11.243,1.665,15.686,0.211c3.871-1.267,4.833-2.463,6.875-5.514
c1.932-2.887,2.112-9.526,2.475-13.186c0.069-0.698,0.162-1.334,0.162-1.92v-16.21C45.396,15.812,45.038,14.954,44.323,14.238z
 M38.807,25.663c0,5.238-4.262,9.5-9.5,9.5s-9.5-4.262-9.5-9.5s4.262-9.5,9.5-9.5S38.807,20.425,38.807,25.663z`;

    super( shape, options );
  }
}

AccessibleSlider.mixInto( RatioHandNode );

ratioAndProportion.register( 'RatioHandNode', RatioHandNode );
export default RatioHandNode;