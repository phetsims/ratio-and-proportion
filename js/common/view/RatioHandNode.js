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
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import filledInHandImage from '../../../images/filled-in-hand_png.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RatioHandNode extends Node {

  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Range} valueRange
   * @param {Property.<number>} gridBaseUnitProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, valueRange, gridBaseUnitProperty, options ) {

    options = merge( {
      isRight: true, // right hand or left hand
      asIcon: false // when true, no input will be attached
    }, options );
    super();

    // Always the same range, always enabled
    !options.asIcon && this.initializeAccessibleSlider( valueProperty, new Property( valueRange ), new BooleanProperty( true ), options );

    // @private
    const handImage = new Image( filledInHandImage );
    const handCircle = new Circle( 10, {
      fill: 'white'
    } );

    // empirical multipliers to center hand on palm. Don't change these without altering the layout for the cue arrows too.
    handImage.right = handImage.width * .4;
    handImage.bottom = handImage.height * .28;

    // don't change update this for icons
    !options.asIcon && gridBaseUnitProperty.link( baseUnit => {
      const downDelta = 1 / baseUnit;
      this.setKeyboardStep( downDelta );
      this.setShiftKeyboardStep( downDelta / 10 );
      this.setPageKeyboardStep( 1 / 5 );
    } );

    assert && assert( !options.children, 'RatioHandeNode sets its own children' );
    this.children = [ handImage, handCircle ];

    // Flip the hand if it isn't a right hand. Do this after the circle/hand relative positioning
    this.setScaleMagnitude( ( options.isRight ? 1 : -1 ) * .4, .4 );

    this.mutate( options );
  }

  /**
   * @param {boolean} isRight
   * @param {Object} [options]
   * @returns {Node}
   */
  static createIcon( isRight, options ) {
    return new Node( {
      children: [ new RatioHandNode( new Property( 0 ), new Range( 0, 1 ), new Property( 10 ), merge( {
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