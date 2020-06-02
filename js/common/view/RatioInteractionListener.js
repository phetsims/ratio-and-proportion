// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import KeyStateTracker from '../../../../scenery/js/accessibility/KeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import designingProperties from '../designingProperties.js';

class RatioInteractionListener {

  /**
   * @param {Node} targetNode
   * @param {Property.<number>}leftValueProperty
   * @param {Property.<number>}rightValueProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} firstInteractionProperty
   */
  constructor( targetNode, leftValueProperty, rightValueProperty, valueRange, firstInteractionProperty ) {

    this.keyStateTracker = new KeyStateTracker();
    this.valueRange = valueRange;
    this.targetNode = targetNode;
    this.firstInteractionProperty = firstInteractionProperty;

    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    this.keyStateTracker.keydownEmitter.addListener( event => {
      this.isBeingInteractedWithProperty.value = true;

      if ( event.key === 'ArrowDown' ) {
        this.updateValue( rightValueProperty, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.updateValue( rightValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.updateValue( leftValueProperty, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.updateValue( leftValueProperty, false );
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
  updateValue( property, increment ) {
    this.firstInteractionProperty.value = false;
    const value = 1 / designingProperties.gridBaseUnitProperty.value;
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