// Copyright 2020, University of Colorado Boulder

/**
 * Keyboard interaction listener for moving both ratio halves at the same time. This includes step-wise movement on
 * each ratio term independently (at the same time), as well as jumping both terms to the same value.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import globalKeyStateTracker from '../../../../scenery/js/accessibility/globalKeyStateTracker.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioTerm from '../model/RatioTerm.js';
import RAPConstants from '../RAPConstants.js';
import getKeyboardInputSnappingMapper from './getKeyboardInputSnappingMapper.js';

const TOTAL_RANGE = RAPConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

class BothHandsInteractionListener {

  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {

      // ---- REQUIRED -------------------------------------------------

      // {Node} - Node to add listeners to
      targetNode: required( config.targetNode ),

      // {Property.<RAPRatioTuple>}
      ratioTupleProperty: required( config.ratioTupleProperty ),

      // {Property.<boolean>}
      antecedentInteractedWithProperty: required( config.antecedentInteractedWithProperty ),

      // {Property.<boolean>}
      consequentInteractedWithProperty: required( config.consequentInteractedWithProperty ),

      // {Property.<Range>}
      enabledRatioTermsRangeProperty: required( config.enabledRatioTermsRangeProperty ),

      // {Property.<number>}
      tickMarkRangeProperty: required( config.tickMarkRangeProperty ),

      // {number}
      keyboardStep: required( config.keyboardStep ),

      // {BoundarySoundClip}
      boundarySoundClip: required( config.boundarySoundClip ),

      // {TickMarkBumpSoundClip}
      tickMarkBumpSoundClip: required( config.tickMarkBumpSoundClip ),

      // {Property.<boolean>}
      ratioLockedProperty: required( config.ratioLockedProperty ),

      // {Property.<number>}
      targetRatioProperty: required( config.targetRatioProperty ),

      // {function(RatioTerm):number}
      getIdealTerm: required( config.getIdealTerm ),

      // ---- OPTIONAL -------------------------------------------------

      // Called whenever an interaction occurs that this listener responds to, even if not change occurs to the ratio.
      onInput: _.noop
    }, config );

    // @private
    this.targetNode = config.targetNode;
    this.antecedentInteractedWithProperty = config.antecedentInteractedWithProperty;
    this.consequentInteractedWithProperty = config.consequentInteractedWithProperty;
    this.enabledRatioTermsRangeProperty = config.enabledRatioTermsRangeProperty;
    this.tickMarkRangeProperty = config.tickMarkRangeProperty;
    this.ratioTupleProperty = config.ratioTupleProperty;
    this.keyboardStep = config.keyboardStep;
    this.shiftKeyboardStep = this.keyboardStep * RAPConstants.SHIFT_KEY_MULTIPLIER;
    this.boundarySoundClip = config.boundarySoundClip;
    this.tickMarkBumpSoundClip = config.tickMarkBumpSoundClip;
    this.ratioLockedProperty = config.ratioLockedProperty;
    this.targetRatioProperty = config.targetRatioProperty;
    this.onInput = config.onInput;

    // @private
    this.antecedentMapKeyboardInput = getKeyboardInputSnappingMapper(
      () => config.getIdealTerm( RatioTerm.ANTECEDENT ), config.keyboardStep, this.shiftKeyboardStep );
    this.consequentMapKeyboardInput = getKeyboardInputSnappingMapper(
      () => config.getIdealTerm( RatioTerm.CONSEQUENT ), config.keyboardStep, this.shiftKeyboardStep );

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

            // unlock the ratio because we are snapping out of locked ratio, if target is 1, then we are maintaining
            // that ratio with this input and we can keep the ratio locked.
            if ( wasLocked && this.targetRatioProperty.value !== 1 ) {
              this.ratioLockedProperty.value = false;
            }

            // capture now before altering the ratio lockedProperty changes it
            const rangeForConstraining = this.enabledRatioTermsRangeProperty.value;

            const newValue = 1 / this.tickMarkRangeProperty.value * i;
            const constrained = rangeForConstraining.constrainValue( newValue );
            this.ratioTupleProperty.value = new RAPRatioTuple( constrained, constrained );

            // If this brought to min or max, play the boundary sound
            if ( constrained === TOTAL_RANGE.min || constrained === TOTAL_RANGE.max ) {
              this.boundarySoundClip.play();
            }

            // If the target was 1, or perhaps another way, then setting both values should maintain the locked state
            // if it was previously locked.
            assert && wasLocked && this.targetRatioProperty.value === 1 &&
            assert( this.ratioLockedProperty.value, 'should be locked still after setting both values' );

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