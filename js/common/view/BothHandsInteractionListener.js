// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import KeyStateTracker from '../../../../scenery/js/accessibility/KeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioComponent from '../model/RatioComponent.js';
import RAPConstants from '../RAPConstants.js';

class BothHandsInteractionListener {

  /**
   * @param {Node} targetNode
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Range} valueRange
   * @param {Property.<boolean>} isFirstInteractionProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {number} keyboardStep
   * @param {BoundarySoundClip} boundarySoundClip
   * @param {TickMarkBumpSoundClip} tickMarkBumpSoundClip
   * @param {Property.<boolean>} ratioLockedProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {function(RatioComponent):number} getIdealTerm
   */
  constructor( targetNode, ratioTupleProperty, valueRange,
               isFirstInteractionProperty, tickMarkRangeProperty, keyboardStep, boundarySoundClip, tickMarkBumpSoundClip,
               ratioLockedProperty, targetRatioProperty, getIdealTerm ) {

    // @private
    this.keyStateTracker = new KeyStateTracker();
    this.valueRange = valueRange;
    this.targetNode = targetNode;
    this.isFirstInteractionProperty = isFirstInteractionProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.keyboardStep = keyboardStep;
    this.shiftKeyboardStep = this.keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER;
    this.boundarySoundClip = boundarySoundClip;
    this.tickMarkBumpSoundClip = tickMarkBumpSoundClip;
    this.ratioLockedProperty = ratioLockedProperty;
    this.targetRatioProperty = targetRatioProperty;

    // @private
    this.antecedentMapKeyboardInput = RAPConstants.mapPostProcessKeyboardInput( () => getIdealTerm( RatioComponent.ANTECEDENT ), keyboardStep, this.shiftKeyboardStep );
    this.consequentMapKeyboardInput = RAPConstants.mapPostProcessKeyboardInput( () => getIdealTerm( RatioComponent.CONSEQUENT ), keyboardStep, this.shiftKeyboardStep );

    // @private - true whenever the user is interacting with this listener
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // @public - called when this input causes the ratio to become unlocked (when originally locked)
    this.inputCauseRatioUnlockEmitter = new Emitter();
  }

  /**
   * Consistently handle changing the ratio from increment/decrement
   * @param {'antecedent'|'consequent'} tupleField - what field of the RAPRatioTuple are we changing
   * @param {function(number,number,boolean):number} inputMapper - see RAPConstants.mapPostProcessKeyboardInput
   * @param {boolean} increment - if the value is being incremented, as opposed to decremented.
   * @private
   */
  onValueIncrementDecrement( tupleField, inputMapper, increment ) {
    this.isFirstInteractionProperty.value = false;
    const currentValue = this.ratioTupleProperty.value[ tupleField ];

    const changeAmount = this.keyStateTracker.shiftKeyDown ? this.shiftKeyboardStep : this.keyboardStep;
    const valueDelta = changeAmount * ( increment ? 1 : -1 );

    // Because this interaction uses the keyboard, snap to the keyboard step to handle the case where the hands were
    // previously moved via mouse/touch. See https://github.com/phetsims/ratio-and-proportion/issues/156
    const newValue = inputMapper( currentValue + valueDelta, currentValue, this.keyStateTracker.shiftKeyDown ? this.shiftKeyboardStep : this.keyboardStep );
    const newRatioTuple = tupleField === 'antecedent' ? this.ratioTupleProperty.value.withAntecedent( newValue ) : this.ratioTupleProperty.value.withConsequent( newValue );

    this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.valueRange );

    this.handleSoundOnInput( this.ratioTupleProperty.value[ tupleField ] );
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
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, true );
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, false );
      }
      else {

        // for number keys 0-9, jump both values to that tick mark number. This value changes based on the tickMarkRangeProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' ) {
            this.isFirstInteractionProperty.value = false;

            const wasLocked = this.ratioLockedProperty.value;

            // Unlock ratio before moving both values to prevent model assertions.
            if ( this.ratioLockedProperty ) {
              this.ratioLockedProperty.value = false;
            }

            const newValue = 1 / this.tickMarkRangeProperty.value * i;
            const constrained = this.valueRange.constrainValue( newValue );

            this.ratioTupleProperty.value = new RAPRatioTuple( constrained, constrained );

            // If this brought to min or max, play the boundary sound
            if ( constrained === this.valueRange.min || constrained === this.valueRange.max ) {
              this.boundarySoundClip.play();
            }

            // If the target was 1, we need to skate around the inability for the model to set both values when the
            // ratio is locked. Special case for 0, since 0/0 is not in target ratio.
            if ( wasLocked && !this.ratioLockedProperty.value && this.targetRatioProperty.value === 1 && this.ratioTupleProperty.value !== 0 ) {
              this.ratioLockedProperty.value = true;
            }

            // Because this input can "knock" the ratio out of locked mode, see https://github.com/phetsims/ratio-and-proportion/issues/227
            if ( wasLocked && this.ratioLockedProperty.value === false ) {
              this.inputCauseRatioUnlockEmitter.emit();
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

ratioAndProportion.register( 'BothHandsInteractionListener', BothHandsInteractionListener );
export default BothHandsInteractionListener;