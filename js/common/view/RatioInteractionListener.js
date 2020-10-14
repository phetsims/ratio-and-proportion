// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import KeyStateTracker from '../../../../scenery/js/accessibility/KeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPConstants from '../RAPConstants.js';

class RatioInteractionListener {

  /**
   * @param {Node} targetNode
   * @param {Property.<number>} numeratorProperty
   * @param {Property.<number>} denominatorProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} firstInteractionProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {number} keyboardStep
   */
  constructor( targetNode, numeratorProperty, denominatorProperty, valueRange,
               firstInteractionProperty, tickMarkRangeProperty, keyboardStep ) {

    // @private
    this.keyStateTracker = new KeyStateTracker();
    this.valueRange = valueRange;
    this.targetNode = targetNode;
    this.firstInteractionProperty = firstInteractionProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.numeratorProperty = numeratorProperty;
    this.denominatorProperty = denominatorProperty;
    this.keyboardStep = keyboardStep;

    // @private - true whenever the user is interacting with this listener
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    this.keyStateTracker.keyupEmitter.addListener( () => {
      if ( !this.keyStateTracker.keysAreDown() ) {
        this.isBeingInteractedWithProperty.value = false;
      }
    } );
  }

  /**
   * @private
   * @param property
   * @param increment
   */
  stepValue( property, increment ) {
    this.firstInteractionProperty.value = false;
    const amount = this.keyStateTracker.shiftKeyDown ? this.keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER : this.keyboardStep;
    property.value = this.valueRange.constrainValue( property.value + ( amount * ( increment ? 1 : -1 ) ) );
  }

  /**
   * @public
   */
  blur() {
    this.isBeingInteractedWithProperty.value = false;
  }

  /**
   * @public
   * @param {SceneryEvent} sceneryEvent
   */
  keydown( sceneryEvent ) {

    if ( sceneryEvent.target === this.targetNode ) {

      // Prevents weird scrolling in the a11y view
      sceneryEvent.domEvent.preventDefault();

      this.keyStateTracker.keydownUpdate( sceneryEvent.domEvent );

      // signify that this listener is reserved for keyboard movement so that other listeners can change
      // their behavior during scenery event dispatch
      sceneryEvent.pointer.reserveForKeyboardDrag();

      this.isBeingInteractedWithProperty.value = true;

      if ( event.key === 'ArrowDown' ) {
        this.stepValue( this.denominatorProperty, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.stepValue( this.denominatorProperty, true );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.stepValue( this.numeratorProperty, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.stepValue( this.numeratorProperty, false );
      }
      else if ( event.key.toLowerCase() === 'j' ) {
        this.firstInteractionProperty.value = false;

        // jump both values to the lowest occupied value
        this.denominatorProperty.value = this.numeratorProperty.value = Math.min( this.numeratorProperty.value, this.denominatorProperty.value );
      }
      else {

        // for number keys 0-9, jump both values to that tick mark number. This value changes based on the tickMarkRangeProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' ) {
            this.firstInteractionProperty.value = false;
            const newValue = 1 / this.tickMarkRangeProperty.value * i;
            this.numeratorProperty.value = this.denominatorProperty.value = Utils.clamp( newValue, this.valueRange.min, this.valueRange.max );
          }
        }
      }
    }

  }

  /**
   * @public
   * @param {SceneryEvent} sceneryEvent
   */
  keyup( sceneryEvent ) {
    sceneryEvent.target === this.targetNode && this.keyStateTracker.keyupUpdate( sceneryEvent.domEvent );
  }
}

ratioAndProportion.register( 'RatioInteractionListener', RatioInteractionListener );
export default RatioInteractionListener;