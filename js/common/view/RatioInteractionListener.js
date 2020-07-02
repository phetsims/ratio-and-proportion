// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import KeyStateTracker from '../../../../scenery/js/accessibility/KeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class RatioInteractionListener {

  /**
   * @param {Node} targetNode
   * @param {Property.<number>}leftValueProperty
   * @param {Property.<number>}rightValueProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} firstInteractionProperty
   * @param {Property.<number>} gridBaseUnitProperty
   */
  constructor( targetNode, leftValueProperty, rightValueProperty, valueRange,
               firstInteractionProperty, gridBaseUnitProperty ) {

    // @private
    this.keyStateTracker = new KeyStateTracker();
    this.valueRange = valueRange;
    this.targetNode = targetNode;
    this.firstInteractionProperty = firstInteractionProperty;
    this.gridBaseUnitProperty = gridBaseUnitProperty;
    this.leftValueProperty = leftValueProperty;
    this.rightValueProperty = rightValueProperty;

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
    const value = 1 / this.gridBaseUnitProperty.value;
    const amount = this.keyStateTracker.shiftKeyDown ? value / 10 : value;
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
      this.keyStateTracker.keydownUpdate( sceneryEvent.domEvent );

      // signify that this listener is reserved for keyboard movement so that other listeners can change
      // their behavior during scenery event dispatch
      sceneryEvent.pointer.reserveForKeyboardDrag();

      this.isBeingInteractedWithProperty.value = true;

      if ( event.key === 'ArrowDown' ) {
        this.stepValue( this.rightValueProperty, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.stepValue( this.rightValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.stepValue( this.leftValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.stepValue( this.leftValueProperty, false );
      }
      else if ( event.key.toLowerCase() === 'j' ) {
        this.firstInteractionProperty.value = false;

        // jump both values to the lowest occupied value
        this.rightValueProperty.value = this.leftValueProperty.value = Math.min( this.leftValueProperty.value, this.rightValueProperty.value );
      }
      else {

        // for number keys 0-9, jump both values to that grid line number. This value changes based on the gridBaseUnitProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' ) {
            this.firstInteractionProperty.value = false;
            const newValue = 1 / this.gridBaseUnitProperty.value * i;
            this.leftValueProperty.value = this.rightValueProperty.value = newValue;
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