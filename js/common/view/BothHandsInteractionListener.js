// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard drag listener for moving both ratio halves at the same time
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import merge from '../../../../phet-core/js/merge.js';
import globalKeyStateTracker from '../../../../scenery/js/accessibility/globalKeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioTerm from '../model/RatioTerm.js';
import RAPConstants from '../RAPConstants.js';
import getKeyboardInputSnappingMapper from './getKeyboardInputSnappingMapper.js';

const TOTAL_RANGE = RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class BothHandsInteractionListener {

  // REVIEW: This is a ton of parameters, and seems like a good application of a "config" object.

  /**
   * @param {Node} targetNode
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Property.<boolean>} antecedentInteractedWithProperty
   * @param {Property.<boolean>} consequentInteractedWithProperty
   * @param {Property.<Range>} enabledRatioTermsRangeProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {number} keyboardStep
   * @param {BoundarySoundClip} boundarySoundClip
   * @param {TickMarkBumpSoundClip} tickMarkBumpSoundClip
   * @param {Property.<boolean>} ratioLockedProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {function(RatioTerm):number} getIdealTerm
   * @param {Object} [options]
   */
  constructor( targetNode, ratioTupleProperty,
               antecedentInteractedWithProperty, consequentInteractedWithProperty, enabledRatioTermsRangeProperty,
               tickMarkRangeProperty, keyboardStep, boundarySoundClip, tickMarkBumpSoundClip,
               ratioLockedProperty, targetRatioProperty, getIdealTerm, options ) {

    options = merge( {

      // Called whenever an interaction occurs that this listener responds to, even if not change occurs to the ratio.
      onInput: _.noop
    }, options );

    // @private
    this.targetNode = targetNode;
    this.antecedentInteractedWithProperty = antecedentInteractedWithProperty;
    this.consequentInteractedWithProperty = consequentInteractedWithProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkRangeProperty = tickMarkRangeProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.keyboardStep = keyboardStep;
    this.shiftKeyboardStep = this.keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER;
    this.boundarySoundClip = boundarySoundClip;
    this.tickMarkBumpSoundClip = tickMarkBumpSoundClip;
    this.ratioLockedProperty = ratioLockedProperty;
    this.targetRatioProperty = targetRatioProperty;
    this.onInput = options.onInput;

    // @private
    this.antecedentMapKeyboardInput = getKeyboardInputSnappingMapper( () => getIdealTerm( RatioTerm.ANTECEDENT ), keyboardStep, this.shiftKeyboardStep );
    this.consequentMapKeyboardInput = getKeyboardInputSnappingMapper( () => getIdealTerm( RatioTerm.CONSEQUENT ), keyboardStep, this.shiftKeyboardStep );

    // @private - true whenever the user is interacting with this listener
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // @public - called when this input causes the ratio to become unlocked (when originally locked)
    this.inputCauseRatioUnlockEmitter = new Emitter();
  }

  /**
   * @public
   */
  reset() {
    this.antecedentMapKeyboardInput.reset();
    this.consequentMapKeyboardInput.reset();
  }

  /**
   * Consistently handle changing the ratio from increment/decrement
   * @param {'antecedent'|'consequent'} tupleField - what field of the RAPRatioTuple are we changing
   * @param {function(number,number,boolean):number} inputMapper - see getKeyboardInputSnappingMapper
   * @param {boolean} increment - if the value is being incremented, as opposed to decremented.
   * @private
   */
  onValueIncrementDecrement( tupleField, inputMapper, increment ) {
    const currentTuple = this.ratioTupleProperty.value[ tupleField ];

    const changeAmount = globalKeyStateTracker.shiftKeyDown ? this.shiftKeyboardStep : this.keyboardStep;
    const valueDelta = changeAmount * ( increment ? 1 : -1 );

    // Because this interaction uses the keyboard, snap to the keyboard step to handle the case where the hands were
    // previously moved via mouse/touch. See https://github.com/phetsims/ratio-and-proportion/issues/156
    const newValue = inputMapper( currentTuple + valueDelta, currentTuple, globalKeyStateTracker.shiftKeyDown ? this.shiftKeyboardStep : this.keyboardStep );
    const newRatioTuple = tupleField === 'antecedent' ? this.ratioTupleProperty.value.withAntecedent( newValue ) : this.ratioTupleProperty.value.withConsequent( newValue );

    this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.enabledRatioTermsRangeProperty.value );

    this.handleSoundOnInput( this.ratioTupleProperty.value[ tupleField ] );

    this.onInput();
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

      // signify that this listener is reserved for keyboard movement so that other listeners can change
      // their behavior during scenery event dispatch
      sceneryEvent.pointer.reserveForKeyboardDrag();

      this.isBeingInteractedWithProperty.value = true;

      if ( event.key === 'ArrowDown' ) {
        this.consequentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, false );
      }
      else if ( event.key === 'ArrowUp' ) {
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, true );
        this.consequentInteractedWithProperty.value = true;
      }
      else if ( event.key.toLowerCase() === 'w' ) {
        this.antecedentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, true );
      }
      else if ( event.key.toLowerCase() === 's' ) {
        this.antecedentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, false );
      }
      else {

        // for number keys 0-9, jump both values to that tick mark number. This value changes based on the tickMarkRangeProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( event.key === i + '' &&
               !event.getModifierState( 'Control' ) &&
               !event.getModifierState( 'Shift' ) &&
               !event.getModifierState( 'Alt' ) ) {

            const wasLocked = this.ratioLockedProperty.value;

            // capture now before altering the ratio lockedProperty changes it
            const rangeForConstraining = this.enabledRatioTermsRangeProperty.value;

            // Unlock ratio before moving both values to prevent model assertions.
            if ( this.ratioLockedProperty ) {
              this.ratioLockedProperty.value = false;
            }

            const newValue = 1 / this.tickMarkRangeProperty.value * i;
            const constrained = rangeForConstraining.constrainValue( newValue );
            this.ratioTupleProperty.value = new RAPRatioTuple( constrained, constrained );

            // If this brought to min or max, play the boundary sound
            if ( constrained === TOTAL_RANGE.min || constrained === TOTAL_RANGE.max ) {
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

            // Count number key interaction as cue-removing interaction.
            this.antecedentInteractedWithProperty.value = true;
            this.consequentInteractedWithProperty.value = true;

            this.onInput();

            break;
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
}

ratioAndProportion.register( 'BothHandsInteractionListener', BothHandsInteractionListener );
export default BothHandsInteractionListener;