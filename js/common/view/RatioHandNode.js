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
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import cutOutHandImage from '../../../images/cutout-hand_png.js';
import filledInHandImage from '../../../images/filled-in-hand_png.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';
import TickMarkView from './TickMarkView.js';

class RatioHandNode extends Node {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Range} enabledRatioComponentsRangeProperty
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {number} keyboardStep
   * @param {Object} [options]
   */
  constructor( valueProperty, enabledRatioComponentsRangeProperty, tickMarkViewProperty, keyboardStep, options ) {

    options = merge( {
      cursor: 'pointer',
      isRight: true, // right hand or left hand
      asIcon: false, // when true, no input will be attached

      keyboardStep: keyboardStep,
      shiftKeyboardStep: keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER,
      pageKeyboardStep: 1 / 5
    }, options );
    super();

    // Always the same range, always enabled
    !options.asIcon && this.initializeAccessibleSlider( valueProperty, enabledRatioComponentsRangeProperty, new BooleanProperty( true ), options );

    // @private
    const filledInHandNode = new Image( filledInHandImage );
    const cutOutHandNode = new Image( cutOutHandImage, {
      visible: false
    } );

    const container = new Node( {
      children: [ filledInHandNode, cutOutHandNode ],
      excludeInvisibleChildrenFromBounds: true
    } );
    this.addChild( container );

    // empirical multipliers to center hand on palm. Don't change these without altering the layout for the cue arrows too.
    container.right = container.width * .365;
    container.bottom = container.height * .5;

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
      children: [ new RatioHandNode( new Property( 0 ), new Range( 0, 1 ), tickMarkViewProperty, new Property( 10 ), merge( {
        isRight: isRight,
        asIcon: true,
        pickable: false
      }, options ) ) ]
    } );
  }
}

AccessibleSlider.mixInto( RatioHandNode );

ratioAndProportion.register( 'RatioHandNode', RatioHandNode );
export default RatioHandNode;