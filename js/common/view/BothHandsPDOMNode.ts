// Copyright 2020-2022, University of Colorado Boulder

/**
 * PDOM view for interacting with both hands at the same time. This adds a custom interaction, as well as PDOM
 * formatting like adding the "application" role to support alternative input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import { Node, NodeOptions, ParallelDOM } from '../../../../scenery/js/imports.js';
import AriaLiveAnnouncer from '../../../../utterance-queue/js/AriaLiveAnnouncer.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import BothHandsInteractionListener, { getIdealTermType } from './BothHandsInteractionListener.js';
import ViewSounds from './sound/ViewSounds.js';
import BothHandsDescriber from './describers/BothHandsDescriber.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import Range from '../../../../dot/js/Range.js';
import CueArrowsState from './CueArrowsState.js';
import RatioDescriber from './describers/RatioDescriber.js';
import TickMarkView from './TickMarkView.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';

// constants
const OBJECT_RESPONSE_DELAY = 500;

type BothHandsPDOMNodeDefinedOptions = {
  ratioTupleProperty: Property<RAPRatioTuple>;
  enabledRatioTermsRangeProperty: Property<Range>;
  cueArrowsState: CueArrowsState;
  keyboardStep: number;
  tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  tickMarkRangeProperty: Property<number>;
  unclampedFitnessProperty: Property<number>;
  ratioDescriber: RatioDescriber;
  bothHandsDescriber: BothHandsDescriber;
  playTickMarkBumpSoundProperty: Property<boolean>;
  ratioLockedProperty: Property<boolean>;
  targetRatioProperty: Property<number>;
  getIdealTerm: getIdealTermType;
  inProportionProperty: Property<boolean>;
  gestureDescriptionHelpText?: string;
  interactiveNodeOptions?: NodeOptions;
};

type BothHandsPDOMNodeOptions = BothHandsPDOMNodeDefinedOptions & Omit<NodeOptions, 'pdomOrder'>;
type BothHandsPDOMNodeImplementationOptions = Required<BothHandsPDOMNodeDefinedOptions> & NodeOptions;

class BothHandsPDOMNode extends Node {

  private bothHandsDescriber: BothHandsDescriber;
  private antecedentInteractedWithProperty: Property<boolean>;
  private consequentInteractedWithProperty: Property<boolean>;
  private bothHandsFocusedProperty: Property<boolean>;
  private viewSounds: ViewSounds;
  objectResponseUtterance: Utterance;
  objectResponseOnFocusUtterance: Utterance;
  contextResponseUtterance: Utterance;
  ratioUnlockedFromBothHandsUtterance: Utterance;
  isBeingInteractedWithProperty: Property<boolean>;
  bothHandsInteractionListener: BothHandsInteractionListener;

  /**
   * @param {Object} [providedOptions]
   */
  constructor( providedOptions: BothHandsPDOMNodeOptions ) {

    const options = merge( {

      // ---- REQUIRED -------------------------------------------------

      // {Property.<RAPRatioTuple>}
      ratioTupleProperty: required( providedOptions.ratioTupleProperty ),

      // {Property.<Range>}
      enabledRatioTermsRangeProperty: required( providedOptions.enabledRatioTermsRangeProperty ),

      // {CueArrowsState}
      cueArrowsState: required( providedOptions.cueArrowsState ),

      // {number}
      keyboardStep: required( providedOptions.keyboardStep ),

      // {EnumerationProperty<TickMarkView>}
      tickMarkViewProperty: required( providedOptions.tickMarkViewProperty ),

      // {Property.<number>}
      tickMarkRangeProperty: required( providedOptions.tickMarkRangeProperty ),

      // {Property.<number>}
      unclampedFitnessProperty: required( providedOptions.unclampedFitnessProperty ),

      // {RatioDescriber}
      ratioDescriber: required( providedOptions.ratioDescriber ),

      // {BothHandsDescriber}
      bothHandsDescriber: required( providedOptions.bothHandsDescriber ),

      // {BooleanProperty}
      playTickMarkBumpSoundProperty: required( providedOptions.playTickMarkBumpSoundProperty ),

      // {BooleanProperty}
      ratioLockedProperty: required( providedOptions.ratioLockedProperty ),

      // {Property.<number>}
      targetRatioProperty: required( providedOptions.targetRatioProperty ),

      // {function(RatioTerm):number}
      getIdealTerm: required( providedOptions.getIdealTerm ),

      // {Property.<boolean>} - is the model in proportion right now
      inProportionProperty: required( providedOptions.inProportionProperty ),


      // ---- OPTIONAL -------------------------------------------------

      // {string|null} help text to be displayed on devices supporting gesture description
      // (see `Sim.supportsGestureDescription`). When null, this will be the same as the default helpText.
      gestureDescriptionHelpText: null,

      // pdom
      tagName: 'div',
      interactiveNodeOptions: {
        helpText: ratioAndProportionStrings.a11y.bothHands.bothHandsHelpText, // overridden by options.gestureDescriptionHelpText when supported
        helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
        ariaRole: 'application',
        focusable: true,
        tagName: 'div',
        innerContent: ratioAndProportionStrings.a11y.bothHands.bothHands,
        ariaLabel: ratioAndProportionStrings.a11y.bothHands.bothHands
      }
    }, providedOptions ) as BothHandsPDOMNodeImplementationOptions;

    super();

    if ( phet.joist.sim.supportsGestureDescription && options.gestureDescriptionHelpText ) {
      options.interactiveNodeOptions.helpText = options.gestureDescriptionHelpText;
    }

    this.bothHandsDescriber = options.bothHandsDescriber;

    // @private - To support proper cue arrow logic
    this.antecedentInteractedWithProperty = new BooleanProperty( false );
    this.consequentInteractedWithProperty = new BooleanProperty( false );
    this.bothHandsFocusedProperty = new BooleanProperty( false );

    this.viewSounds = new ViewSounds( options.tickMarkRangeProperty, options.tickMarkViewProperty, options.playTickMarkBumpSoundProperty );

    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty
    ], ( antecedentInteractedWith: boolean, consequentInteractedWith: boolean ) => {
      options.cueArrowsState.bothHands.interactedWithProperty.value = antecedentInteractedWith || consequentInteractedWith;

      // If both hands have been interacted with, then no need for individual cues either
      if ( antecedentInteractedWith && consequentInteractedWith ) {
        options.cueArrowsState.interactedWithKeyboardProperty.value = true;
      }
    } );
    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty,
      this.bothHandsFocusedProperty
    ], ( antecedentInteractedWith: boolean, consequentInteractedWith: boolean, bothHandsFocused: boolean ) => {
      options.cueArrowsState.bothHands.antecedentCueDisplayedProperty.value = !antecedentInteractedWith && bothHandsFocused;
      options.cueArrowsState.bothHands.consequentCueDisplayedProperty.value = !consequentInteractedWith && bothHandsFocused;
    } );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    // Make sure that any children inside the both hands interaction (like individual hands) come before the both hands interaction in the PDOM.
    this.pdomOrder = [ dynamicDescription, ...interactiveNode.children, null ];

    interactiveNode.setPDOMAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    // @private
    this.bothHandsInteractionListener = new BothHandsInteractionListener( {
      targetNode: interactiveNode,
      ratioTupleProperty: options.ratioTupleProperty,
      antecedentInteractedWithProperty: this.antecedentInteractedWithProperty,
      consequentInteractedWithProperty: this.consequentInteractedWithProperty,
      enabledRatioTermsRangeProperty: options.enabledRatioTermsRangeProperty,
      tickMarkRangeProperty: options.tickMarkRangeProperty,
      keyboardStep: options.keyboardStep,
      boundarySoundClip: this.viewSounds.boundarySoundClip,
      tickMarkBumpSoundClip: this.viewSounds.tickMarkBumpSoundClip,
      ratioLockedProperty: options.ratioLockedProperty,
      targetRatioProperty: options.targetRatioProperty,
      getIdealTerm: options.getIdealTerm,
      inProportionProperty: options.inProportionProperty,
      onInput: ( knockedOutOfLock?: boolean ) => {
        if ( knockedOutOfLock ) {

          this.alertDescriptionUtterance( this.ratioUnlockedFromBothHandsUtterance );
        }

        this.alertBothHandsContextResponse( knockedOutOfLock );
      }
    } );

    interactiveNode.addInputListener( this.bothHandsInteractionListener );
    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( true );
        this.viewSounds.grabSoundClip.play();
        this.bothHandsFocusedProperty.value = true;
      },
      blur: () => {
        this.viewSounds.releaseSoundClip.play();
        this.bothHandsFocusedProperty.value = false;

        // This only works because the bothHandsInteractionListener needs alt-input control resetting
        this.bothHandsInteractionListener.reset();
      },
      down: () => {
        this.bothHandsFocusedProperty.value = false;
        this.bothHandsInteractionListener.reset();
      }
    } );

    // @private
    this.objectResponseUtterance = new Utterance( {
      alertStableDelay: OBJECT_RESPONSE_DELAY,
      announcerOptions: {

        // This "object response" is meant to act more like aria-valuetext than a traditional, polite alert. We want
        // this to cut off any other alert. This fixes alert-build-up described in https://github.com/phetsims/ratio-and-proportion/issues/214
        // TODO: https://github.com/phetsims/ratio-and-proportion/issues/404
        ariaLivePriority: ( AriaLiveAnnouncer.AriaLive as any ).ASSERTIVE
      }
    } );

    // @private - just to fire on focus, make this polite for https://github.com/phetsims/ratio-and-proportion/issues/347
    this.objectResponseOnFocusUtterance = new Utterance( {
      alertStableDelay: 50
    } );

    // @private
    this.contextResponseUtterance = new Utterance( { alertStableDelay: 2000 } );
    this.ratioUnlockedFromBothHandsUtterance = new Utterance( {
      alert: ratioAndProportionStrings.a11y.ratioNoLongerLocked,

      // slightly longer than the object response so that we make sure it comes after that assertive alert. This is
      // because we don't want it interrupted like it was originally in https://github.com/phetsims/ratio-and-proportion/issues/227#issuecomment-740173738
      alertStableDelay: OBJECT_RESPONSE_DELAY + 10
    } );

    // @public (read-only) - expose this from the listener for general consumption
    this.isBeingInteractedWithProperty = this.bothHandsInteractionListener.isBeingInteractedWithProperty;

    // Though most cases are covered by just listening to fitness, there are certain cases when Property values can change,
    // but the fitness doesn't. See https://github.com/phetsims/ratio-and-proportion/issues/222 as an example.
    Property.multilink( [
      options.tickMarkViewProperty,
      options.tickMarkRangeProperty,
      options.ratioTupleProperty,
      options.unclampedFitnessProperty
    ], ( ...args: any[] ) => {

      dynamicDescription.innerContent = this.bothHandsDescriber.getBothHandsDynamicDescription();

      if ( this.bothHandsInteractionListener.isBeingInteractedWithProperty.value ) {
        this.alertBothHandsObjectResponse();
      }
    } );

    // emit this utterance immediately, so that it comes before the object response above.
    this.bothHandsInteractionListener.jumpToZeroWhileLockedEmitter.addListener( () => {

      this.alertDescriptionUtterance( ratioAndProportionStrings.a11y.bothHands.cannotJumpToZeroWhenLocked );
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();

      this.alertDescriptionUtterance( this.contextResponseUtterance );
    } );

    this.mutate( options );
  }

  /**
   * @public
   */
  reset(): void {
    this.antecedentInteractedWithProperty.reset();
    this.consequentInteractedWithProperty.reset();
    this.bothHandsFocusedProperty.reset();
    this.bothHandsInteractionListener.reset();
    this.objectResponseUtterance.reset();
    this.contextResponseUtterance.reset();
    this.ratioUnlockedFromBothHandsUtterance.reset();
    this.viewSounds.reset();
  }

  /**
   * @private
   */
  alertBothHandsObjectResponse( onFocus = false ): void {
    const utterance = onFocus ? this.objectResponseOnFocusUtterance : this.objectResponseUtterance;
    utterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();

    this.alertDescriptionUtterance( utterance );
  }

  /**
   * @private
   */
  alertBothHandsContextResponse( knockedOutOfLock?: boolean ): void {
    if ( knockedOutOfLock ) {
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();
    }
    else {
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsContextResponse();
    }

    this.alertDescriptionUtterance( this.contextResponseUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export type { BothHandsPDOMNodeOptions };
export default BothHandsPDOMNode;