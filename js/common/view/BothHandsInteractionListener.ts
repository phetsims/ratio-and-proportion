// Copyright 2020-2021, University of Colorado Boulder

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
import { globalKeyStateTracker } from '../../../../scenery/js/imports.js';
import { KeyboardUtils } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import RatioTerm from '../model/RatioTerm.js';
import rapConstants from '../rapConstants.js';
import getKeyboardInputSnappingMapper, { KeyboardInputMapper } from './getKeyboardInputSnappingMapper.js';
import { Node } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import BoundarySoundClip from './sound/BoundarySoundClip.js';
import TickMarkBumpSoundClip from './sound/TickMarkBumpSoundClip.js';
import { SceneryEvent } from '../../../../scenery/js/imports.js';

const TOTAL_RANGE = rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE;

type OnInputType = ( knockOutOfLock?: boolean ) => void;
const onInputDefault = () => {};

type getIdealTermType = ( ratioTerm: RatioTerm ) => number;

type BothHandsInteractionListenerOptions = {
  targetNode: Node;
  ratioTupleProperty: Property<RAPRatioTuple>;
  antecedentInteractedWithProperty: Property<boolean>;
  consequentInteractedWithProperty: Property<boolean>;
  enabledRatioTermsRangeProperty: Property<Range>;
  tickMarkRangeProperty: Property<number>;
  keyboardStep: number;
  boundarySoundClip: BoundarySoundClip;
  tickMarkBumpSoundClip: TickMarkBumpSoundClip;
  ratioLockedProperty: Property<boolean>;
  targetRatioProperty: Property<number>;
  inProportionProperty: Property<boolean>;
  getIdealTerm: getIdealTermType;
  onInput?: OnInputType;
};

class BothHandsInteractionListener {

  private targetNode: Node;
  private antecedentInteractedWithProperty: Property<boolean>;
  private consequentInteractedWithProperty: Property<boolean>;
  private enabledRatioTermsRangeProperty: Property<Range>;
  private tickMarkRangeProperty: Property<number>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private keyboardStep: number;
  private shiftKeyboardStep: number;
  private boundarySoundClip: BoundarySoundClip;
  private tickMarkBumpSoundClip: TickMarkBumpSoundClip;
  private ratioLockedProperty: Property<boolean>;
  private targetRatioProperty: Property<number>;
  private inProportionProperty: Property<boolean>;
  private onInput: OnInputType;
  private antecedentMapKeyboardInput: KeyboardInputMapper;
  private consequentMapKeyboardInput: KeyboardInputMapper;
  isBeingInteractedWithProperty: Property<boolean>;
  jumpToZeroWhileLockedEmitter: Emitter<[]>;
  private playBoundarySoundOnKeyup: boolean;

  /**
   * @param {Object} config
   */
  constructor( config: BothHandsInteractionListenerOptions ) {

    const filledConfig = merge( {

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

      // {Property.<boolean>} - is the model in proportion right now
      inProportionProperty: required( config.inProportionProperty ),

      // ---- OPTIONAL -------------------------------------------------

      // Called whenever an interaction occurs that this listener responds to, even if not change occurs to the ratio.
      onInput: onInputDefault
    }, config ) as Required<BothHandsInteractionListenerOptions>;

    // @private
    this.targetNode = filledConfig.targetNode;
    this.ratioTupleProperty = filledConfig.ratioTupleProperty;
    this.antecedentInteractedWithProperty = filledConfig.antecedentInteractedWithProperty;
    this.consequentInteractedWithProperty = filledConfig.consequentInteractedWithProperty;
    this.enabledRatioTermsRangeProperty = filledConfig.enabledRatioTermsRangeProperty;
    this.tickMarkRangeProperty = filledConfig.tickMarkRangeProperty;
    this.keyboardStep = filledConfig.keyboardStep;
    this.shiftKeyboardStep = this.keyboardStep * rapConstants.SHIFT_KEY_MULTIPLIER;
    this.boundarySoundClip = filledConfig.boundarySoundClip;
    this.tickMarkBumpSoundClip = filledConfig.tickMarkBumpSoundClip;
    this.ratioLockedProperty = filledConfig.ratioLockedProperty;
    this.targetRatioProperty = filledConfig.targetRatioProperty;
    this.inProportionProperty = filledConfig.inProportionProperty;
    this.onInput = filledConfig.onInput;

    // @private
    this.antecedentMapKeyboardInput = getKeyboardInputSnappingMapper(
      () => filledConfig.getIdealTerm( RatioTerm.ANTECEDENT ), filledConfig.keyboardStep, this.shiftKeyboardStep );
    this.consequentMapKeyboardInput = getKeyboardInputSnappingMapper(
      () => filledConfig.getIdealTerm( RatioTerm.CONSEQUENT ), filledConfig.keyboardStep, this.shiftKeyboardStep );

    // @private - true whenever the user is interacting with this listener
    this.isBeingInteractedWithProperty = new BooleanProperty( false );

    // @public - called when this input occurs when the ratio is locked with a target of N:N. Jumping to zero is not allowed for this case, see, https://github.com/phetsims/ratio-and-proportion/issues/227#issuecomment-758036456
    this.jumpToZeroWhileLockedEmitter = new Emitter();

    // The custom jumping logic uses special logic to determine if jumping caused a boundary to be hit. That occurs in
    // keydown, but we want the sound only to play once on keyup. Use this as a marker to signify that the boundary
    // sound should be played.
    this.playBoundarySoundOnKeyup = false;
  }

  /**
   * @public
   */
  reset(): void {
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
  onValueIncrementDecrement( tupleField: 'antecedent' | 'consequent', inputMapper: KeyboardInputMapper, increment: boolean ): void {
    this.isBeingInteractedWithProperty.value = true;
    const currentValueFromTuple = this.ratioTupleProperty.value[ tupleField ];

    const changeAmount = globalKeyStateTracker.shiftKeyDown ? this.shiftKeyboardStep : this.keyboardStep;
    const valueDelta = changeAmount * ( increment ? 1 : -1 );

    // Because this interaction uses the keyboard, snap to the keyboard step to handle the case where the hands were
    // previously moved via mouse/touch. See https://github.com/phetsims/ratio-and-proportion/issues/156
    const newValue = inputMapper( currentValueFromTuple + valueDelta, currentValueFromTuple, globalKeyStateTracker.shiftKeyDown, this.inProportionProperty.value );
    const newRatioTuple = tupleField === 'antecedent' ? this.ratioTupleProperty.value.withAntecedent( newValue ) : this.ratioTupleProperty.value.withConsequent( newValue );

    this.ratioTupleProperty.value = newRatioTuple.constrainFields( this.enabledRatioTermsRangeProperty.value );

    this.tickMarkBumpSoundClip.onInteract( this.ratioTupleProperty.value[ tupleField ] );

    this.onInput();
  }

  /**
   * @public
   */
  blur(): void {
    this.isBeingInteractedWithProperty.value = false;
  }

  /**
   * @public
   * @param {SceneryEvent} sceneryEvent
   */
  keydown( sceneryEvent: SceneryEvent ): void {

    if ( sceneryEvent.target === this.targetNode ) {

      // signify that this listener is reserved for keyboard movement so that other listeners can change
      // their behavior during scenery event dispatch
      sceneryEvent.pointer.reserveForKeyboardDrag();

      assert && assert( sceneryEvent.domEvent, 'dom event expected' );
      const domEvent = sceneryEvent.domEvent as Event;
      const key = KeyboardUtils.getEventCode( domEvent );

      if ( key === KeyboardUtils.KEY_DOWN_ARROW ) {
        this.consequentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, false );
      }
      else if ( key === KeyboardUtils.KEY_UP_ARROW ) {
        this.onValueIncrementDecrement( 'consequent', this.consequentMapKeyboardInput, true );
        this.consequentInteractedWithProperty.value = true;
      }
      else if ( key === KeyboardUtils.KEY_W ) {
        this.antecedentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, true );
      }
      else if ( key === KeyboardUtils.KEY_S ) {
        this.antecedentInteractedWithProperty.value = true;
        this.onValueIncrementDecrement( 'antecedent', this.antecedentMapKeyboardInput, false );
      }
      else {

        // for number keys 0-9, jump both values to that tick mark number. This value changes based on the tickMarkRangeProperty
        for ( let i = 0; i <= 9; i++ ) {
          if ( KeyboardUtils.getNumberFromCode( domEvent ) === i &&

               // @ts-ignore
               !domEvent.getModifierState( 'Control' ) &&

               // @ts-ignore
               !domEvent.getModifierState( 'Shift' ) &&

               // @ts-ignore
               !domEvent.getModifierState( 'Alt' ) ) {

            this.isBeingInteractedWithProperty.value = true;

            // If the ratio is locked, and the target is 1, this case means that going to 0:0 would be a buggy case.
            // Here we will just disable this feature.
            if ( this.ratioLockedProperty.value && this.targetRatioProperty.value === 1 && i === 0 ) {
              this.jumpToZeroWhileLockedEmitter.emit();
              return;
            }

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
              this.playBoundarySoundOnKeyup = true;
            }

            // If the target was 1, or perhaps another way, then setting both values should maintain the locked state
            // if it was previously locked.
            assert && wasLocked && this.targetRatioProperty.value === 1 &&
            assert( this.ratioLockedProperty.value, 'should be locked still after setting both values' );


            // Count number key interaction as cue-removing interaction.
            this.antecedentInteractedWithProperty.value = true;
            this.consequentInteractedWithProperty.value = true;

            // Extra arg here because this input can "knock" the ratio out of locked mode, see https://github.com/phetsims/ratio-and-proportion/issues/227
            this.onInput( wasLocked && !this.ratioLockedProperty.value );

            break;
          }
        }
      }
    }
  }


  /**
   * @public
   * @param {SceneryEvent} sceneryEvent
   */
  keyup( sceneryEvent: SceneryEvent ): void {

    if ( sceneryEvent.target === this.targetNode ) {

      assert && assert( sceneryEvent.domEvent, 'domEvent expected' );
      const domEvent = sceneryEvent.domEvent as Event;

      if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_DOWN_ARROW, KeyboardUtils.KEY_UP_ARROW ] ) ) {
        this.handleBoundarySoundOnInput( this.ratioTupleProperty.value.consequent );
      }
      else if ( KeyboardUtils.isAnyKeyEvent( domEvent, [ KeyboardUtils.KEY_W, KeyboardUtils.KEY_S ] ) ) {
        this.handleBoundarySoundOnInput( this.ratioTupleProperty.value.antecedent );
      }
      if ( this.playBoundarySoundOnKeyup ) {
        this.boundarySoundClip.play();
        this.playBoundarySoundOnKeyup = false;
      }
    }
  }

  /**
   * @public
   * Handle boundary sound output based on an input for this interaction
   * @param {number} newValue
   */
  handleBoundarySoundOnInput( newValue: number ): void {
    this.boundarySoundClip.onStartInteraction();
    this.boundarySoundClip.onInteract( newValue );
    this.boundarySoundClip.onEndInteraction( newValue );
  }
}

ratioAndProportion.register( 'BothHandsInteractionListener', BothHandsInteractionListener );
export type { getIdealTermType };
export default BothHandsInteractionListener;