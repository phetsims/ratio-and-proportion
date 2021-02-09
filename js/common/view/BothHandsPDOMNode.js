// Copyright 2020, University of Colorado Boulder

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
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import AriaHerald from '../../../../utterance-queue/js/AriaHerald.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import BothHandsInteractionListener from './BothHandsInteractionListener.js';
import ViewSounds from './sound/ViewSounds.js';

// constants
const OBJECT_RESPONSE_DELAY = 500;

class BothHandsPDOMNode extends Node {

  /**
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {

      // ---- REQUIRED -------------------------------------------------

      // {Property.<RAPRatioTuple>}
      ratioTupleProperty: required( config.ratioTupleProperty ),

      // {Property.<Range>}
      enabledRatioTermsRangeProperty: required( config.enabledRatioTermsRangeProperty ),

      // {CueArrowsState}
      cueArrowsState: required( config.cueArrowsState ),

      // {number}
      keyboardStep: required( config.keyboardStep ),

      // {EnumerationProperty.<TickMarkView>}
      tickMarkViewProperty: required( config.tickMarkViewProperty ),

      // {Property.<number>}
      tickMarkRangeProperty: required( config.tickMarkRangeProperty ),

      // {Property.<number>}
      unclampedFitnessProperty: required( config.unclampedFitnessProperty ),

      // {RatioDescriber}
      ratioDescriber: required( config.ratioDescriber ),

      // {BothHandsDescriber}
      bothHandsDescriber: required( config.bothHandsDescriber ),

      // {BooleanProperty}
      playTickMarkBumpSoundProperty: required( config.playTickMarkBumpSoundProperty ),

      // {BooleanProperty}
      ratioLockedProperty: required( config.ratioLockedProperty ),

      // {Property.<number>}
      targetRatioProperty: required( config.targetRatioProperty ),

      // {function(RatioTerm):number}
      getIdealTerm: required( config.getIdealTerm ),

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
    }, config );
    assert && assert( !config.pdomOrder, 'BothHandsPDOMNode sets its own pdomOrder.' );

    super();

    if ( phet.joist.sim.supportsGestureDescription && config.gestureDescriptionHelpText ) {
      config.interactiveNodeOptions.helpText = config.gestureDescriptionHelpText;
    }

    this.bothHandsDescriber = config.bothHandsDescriber;

    // @private - To support proper cue arrow logic
    this.antecedentInteractedWithProperty = new BooleanProperty( false );
    this.consequentInteractedWithProperty = new BooleanProperty( false );
    this.bothHandsFocusedProperty = new BooleanProperty( false );

    this.viewSounds = new ViewSounds( config.tickMarkRangeProperty, config.tickMarkViewProperty, config.playTickMarkBumpSoundProperty );

    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty
    ], ( antecedentInteractedWith, consequentInteractedWith ) => {
      config.cueArrowsState.bothHands.interactedWithProperty.value = antecedentInteractedWith || consequentInteractedWith;

      // If both hands have been interacted with, then no need for individual cues either
      if ( antecedentInteractedWith && consequentInteractedWith ) {
        config.cueArrowsState.interactedWithKeyboardProperty.value = true;
      }
    } );
    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty,
      this.bothHandsFocusedProperty
    ], ( antecedentInteractedWith, consequentInteractedWith, bothHandsFocused ) => {
      config.cueArrowsState.bothHands.antecedentCueDisplayedProperty.value = !antecedentInteractedWith && bothHandsFocused;
      config.cueArrowsState.bothHands.consequentCueDisplayedProperty.value = !consequentInteractedWith && bothHandsFocused;
    } );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    const interactiveNode = new Node( config.interactiveNodeOptions );
    this.addChild( interactiveNode );

    // Make sure that any children inside the both hands interaction (like individual hands) come before the both hands interaction in the PDOM.
    this.pdomOrder = [ dynamicDescription, ...interactiveNode.children, null ];

    interactiveNode.setPDOMAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    // @private
    this.bothHandsInteractionListener = new BothHandsInteractionListener( {
      targetNode: interactiveNode,
      ratioTupleProperty: config.ratioTupleProperty,
      antecedentInteractedWithProperty: this.antecedentInteractedWithProperty,
      consequentInteractedWithProperty: this.consequentInteractedWithProperty,
      enabledRatioTermsRangeProperty: config.enabledRatioTermsRangeProperty,
      tickMarkRangeProperty: config.tickMarkRangeProperty,
      keyboardStep: config.keyboardStep,
      boundarySoundClip: this.viewSounds.boundarySoundClip,
      tickMarkBumpSoundClip: this.viewSounds.tickMarkBumpSoundClip,
      ratioLockedProperty: config.ratioLockedProperty,
      targetRatioProperty: config.targetRatioProperty,
      getIdealTerm: config.getIdealTerm,
      onInput: knockedOutOfLock => {
        if ( knockedOutOfLock ) {
          phet.joist.sim.utteranceQueue.addToBack( this.ratioUnlockedFromBothHandsUtterance );
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
      }
    } );

    // @private
    this.objectResponseUtterance = new Utterance( {
      alertStableDelay: OBJECT_RESPONSE_DELAY,
      announcerOptions: {

        // This "object response" is meant to act more like aria-valuetext than a traditional, polite alert. We want
        // this to cut off any other alert. This fixes alert-build-up described in https://github.com/phetsims/ratio-and-proportion/issues/214
        ariaLivePriority: AriaHerald.AriaLive.ASSERTIVE
      }
    } );

    // @private - just to fire on focus, make this polite for https://github.com/phetsims/ratio-and-proportion/issues/347, TODO: remove this if that issue doesn't go in this direction
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
      config.tickMarkViewProperty,
      config.tickMarkRangeProperty,
      config.ratioTupleProperty,
      config.unclampedFitnessProperty
    ], () => {

      dynamicDescription.innerContent = this.bothHandsDescriber.getBothHandsDynamicDescription();

      if ( this.bothHandsInteractionListener.isBeingInteractedWithProperty.value ) {
        this.alertBothHandsObjectResponse();
      }
    } );

    // emit this utterance immediately, so that it comes before the object response above.
    this.bothHandsInteractionListener.jumpToZeroWhileLockedEmitter.addListener( () => {
      phet.joist.sim.utteranceQueue.addToBack( ratioAndProportionStrings.a11y.bothHands.cannotJumpToZeroWhenLocked );
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();
      phet.joist.sim.utteranceQueue.addToBack( this.contextResponseUtterance );
    } );

    this.mutate( config );
  }

  /**
   * @public
   */
  reset() {
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
  alertBothHandsObjectResponse( onFocus = false ) {
    const utterance = onFocus ? this.objectResponseOnFocusUtterance : this.objectResponseUtterance;
    utterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();
    phet.joist.sim.utteranceQueue.addToBack( utterance );
  }

  /**
   * @private
   */
  alertBothHandsContextResponse( knockedOutOfLock ) {
    if ( knockedOutOfLock ) {
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();
    }
    else {
      this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsContextResponse();
    }
    phet.joist.sim.utteranceQueue.addToBack( this.contextResponseUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;