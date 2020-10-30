// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import KeyStateTracker from '../../../../scenery/js/accessibility/KeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RAPConstants from '../RAPConstants.js';

class RatioInteractionListener {

  /**
   * @param {Node} targetNode
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} firstInteractionProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {number} keyboardStep
   * @param {BoundarySoundClip} boundarySoundClip
   * @param {TickMarkBumpSoundClip} tickMarkBumpSoundClip
   */
  constructor( targetNode, ratioTupleProperty, valueRange,
               firstInteractionProperty, tickMarkRangeProperty, keyboardStep, boundarySoundClip, tickMarkBumpSoundClip ) {

    // @private
    this.keyStateTracker = new KeyStateTracker();
    this.valueRange = valueRange;
    this.targetNode = targetNode;
    this.firstInteractionProperty = firstInteractionProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.keyboardStep = keyboardStep;
    this.boundarySoundClip = boundarySoundClip;
    this.tickMarkBumpSoundClip = tickMarkBumpSoundClip;

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
   * @param {boolean} increment
   */
  getValueDelta( increment ) {
    const amount = this.keyStateTracker.shiftKeyDown ? this.keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER : this.keyboardStep;
    return amount * ( increment ? 1 : -1 );
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
        this.firstInteractionProperty.value = false;
        // this.ratioTupleProperty
        const newRatioTuple = this.ratioTupleProperty.value.plusDenominator( this.getValueDelta( false ) );
        this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.valueRange );
        this.handleSoundOnInput( this.ratioTupleProperty.value.denominator );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.firstInteractionProperty.value = false;
        const newRatioTuple = this.ratioTupleProperty.value.plusDenominator( this.getValueDelta( true ) );
        this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.valueRange );
        this.handleSoundOnInput( this.ratioTupleProperty.value.denominator );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.firstInteractionProperty.value = false;
        const newRatioTuple = this.ratioTupleProperty.value.plusNumerator( this.getValueDelta( true ) );
        this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.valueRange );
        this.handleSoundOnInput( this.ratioTupleProperty.value.numerator );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.firstInteractionProperty.value = false;
        const newRatioTuple = this.ratioTupleProperty.value.plusNumerator( this.getValueDelta( false ) );
        this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.valueRange );
        this.handleSoundOnInput( this.ratioTupleProperty.value.numerator );
      }
      else {

        // for number keys 0-9, jump both values to that tick mark number. This value changes based on the tickMarkRangeProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' ) {
            this.firstInteractionProperty.value = false;
            const newValue = 1 / this.tickMarkRangeProperty.value * i;
            const constrained = this.valueRange.constrainValue( newValue );

            this.ratioTupleProperty.value = new RAPRatioTuple( constrained, constrained );

            // If this brought to min or max, play the boundary sound
            if ( constrained === this.valueRange.min || constrained === this.valueRange.max ) {
              this.boundarySoundClip.play();
            }
          }
        }
      }
    }
  }

  /**
   * @public
   * Handle sound output based on an input for this interaction
   * @param {number} newValue
   */
  handleSoundOnInput( newValue ) {
    this.tickMarkBumpSoundClip.onInteract( newValue );
    this.boundarySoundClip.onStartInteraction( newValue );
    this.boundarySoundClip.onInteract( newValue );
    this.boundarySoundClip.onEndInteraction( newValue );
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