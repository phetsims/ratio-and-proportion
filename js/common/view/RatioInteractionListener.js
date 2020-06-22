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

    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    this.keyStateTracker.keydownEmitter.addListener( event => {
      this.isBeingInteractedWithProperty.value = true;

      if ( event.key === 'ArrowDown' ) {
        this.stepValue( rightValueProperty, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.stepValue( rightValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.stepValue( leftValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.stepValue( leftValueProperty, false );
      }
      else if ( event.key.toLowerCase() === 'j' ) {
        this.firstInteractionProperty.value = false;

        // jump both values to the lowest occupied value
        rightValueProperty.value = leftValueProperty.value = Math.min( leftValueProperty.value, rightValueProperty.value );
      }
      else {

        // for number keys 0-9, jump both values to that grid line number. This value changes based on the gridBaseUnitProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' ) {
            this.firstInteractionProperty.value = false;
            const newValue = 1 / gridBaseUnitProperty.value * i;
            leftValueProperty.value = rightValueProperty.value = newValue;
          }
        }
      }
    } );

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

    // TODO: targetNode is only because there are currently children listeners on each ratio half that we don't want bubbling, https://github.com/phetsims/ratio-and-proportion/issues/44
    sceneryEvent.target === this.targetNode && this.keyStateTracker.keydownUpdate( sceneryEvent.domEvent );
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