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

  // REVIEW: This is a ton of parameters, and seems like a good application of a "config" object.

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Property.<Range>} enabledRatioTermsRangeProperty
   * @param {CueArrowsState} cueArrowsState
   * @param {number} keyboardStep
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {Property.<number>} unclampedFitnessProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {BothHandsDescriber} bothHandsDescriber
   * @param {BooleanProperty} playTickMarkBumpSoundProperty
   * @param {BooleanProperty} ratioLockedProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {function(RatioTerm):number} getIdealTerm
   * @param {Object} [options]
   */
  constructor( ratioTupleProperty,
               enabledRatioTermsRangeProperty,
               cueArrowsState,
               keyboardStep,
               tickMarkViewProperty,
               tickMarkRangeProperty,
               unclampedFitnessProperty,
               ratioDescriber,
               bothHandsDescriber,
               playTickMarkBumpSoundProperty,
               ratioLockedProperty,
               targetRatioProperty,
               getIdealTerm,
               options ) {

    options = merge( {

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
    }, options );
    assert && assert( !options.accessibleOrder, 'BothHandsPDOMNode sets its own accessibleOrder.' );

    super();

    this.bothHandsDescriber = bothHandsDescriber;

    // @private - To support proper cue arrow logic
    this.antecedentInteractedWithProperty = new BooleanProperty( false );
    this.consequentInteractedWithProperty = new BooleanProperty( false );
    this.bothHandsFocusedProperty = new BooleanProperty( false );

    this.viewSounds = new ViewSounds( tickMarkRangeProperty, tickMarkViewProperty, playTickMarkBumpSoundProperty );

    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty
    ], ( antecedentInteractedWith, consequentInteractedWith ) => {
      cueArrowsState.bothHands.interactedWithProperty.value = antecedentInteractedWith || consequentInteractedWith;

      // If both hands have been interacted with, then no need for individual cues either
      if ( antecedentInteractedWith && consequentInteractedWith ) {
        cueArrowsState.interactedWithKeyboardProperty.value = true;
      }
    } );
    Property.multilink( [
      this.antecedentInteractedWithProperty,
      this.consequentInteractedWithProperty,
      this.bothHandsFocusedProperty
    ], ( antecedentInteractedWith, consequentInteractedWith, bothHandsFocused ) => {
      cueArrowsState.bothHands.antecedentCueDisplayedProperty.value = !antecedentInteractedWith && bothHandsFocused;
      cueArrowsState.bothHands.consequentCueDisplayedProperty.value = !consequentInteractedWith && bothHandsFocused;
    } );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    // Make sure that any children inside the both hands interaction (like individual hands) come before the both hands interaction in the PDOM.
    this.accessibleOrder = [ dynamicDescription, ...interactiveNode.children, null ];

    interactiveNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    // @private
    this.bothHandsInteractionListener = new BothHandsInteractionListener( {
      targetNode: interactiveNode,
      ratioTupleProperty: ratioTupleProperty,
      antecedentInteractedWithProperty: this.antecedentInteractedWithProperty,
      consequentInteractedWithProperty: this.consequentInteractedWithProperty,
      enabledRatioTermsRangeProperty: enabledRatioTermsRangeProperty,
      tickMarkRangeProperty: tickMarkRangeProperty,
      keyboardStep: keyboardStep,
      boundarySoundClip: this.viewSounds.boundarySoundClip,
      tickMarkBumpSoundClip: this.viewSounds.tickMarkBumpSoundClip,
      ratioLockedProperty: ratioLockedProperty,
      targetRatioProperty: targetRatioProperty,
      getIdealTerm: getIdealTerm,
      onInput: () => {
        this.alertBothHandsContextResponse();
      }
    } );

    interactiveNode.addInputListener( this.bothHandsInteractionListener );
    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( tickMarkViewProperty.value );
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

    // @private
    this.contextResponseUtterance = new Utterance( { alertStableDelay: 2000 } );
    this.ratioUnlockedFromBothHandsUtterance = new Utterance( {
      alert: ratioAndProportionStrings.a11y.lockRatioCheckboxUnlockedContextResponse,

      // slightly longer than the object response so that we make sure it comes after that assertive alert. This is
      // because we don't want it interrupted like it was originally in https://github.com/phetsims/ratio-and-proportion/issues/227#issuecomment-740173738
      alertStableDelay: OBJECT_RESPONSE_DELAY + 10
    } );

    // @public (read-only) - expose this from the listener for general consumption
    this.isBeingInteractedWithProperty = this.bothHandsInteractionListener.isBeingInteractedWithProperty;

    // Though most cases are covered by just listening to fitness, there are certain cases when Property values can change,
    // but the fitness doesn't. See https://github.com/phetsims/ratio-and-proportion/issues/222 as an example.
    Property.multilink( [ tickMarkViewProperty, ratioTupleProperty, unclampedFitnessProperty ], tickMarkView => {

      dynamicDescription.innerContent = this.bothHandsDescriber.getBothHandsDynamicDescription();

      if ( this.bothHandsInteractionListener.isBeingInteractedWithProperty.value ) {
        this.alertBothHandsObjectResponse( tickMarkView );
      }
    } );

    // emit this utterance immediately, so that it comes before the object response above.
    this.bothHandsInteractionListener.inputCauseRatioUnlockEmitter.addListener( () => {
      phet.joist.sim.utteranceQueue.addToBack( this.ratioUnlockedFromBothHandsUtterance );
    } );

    if ( phet.joist.sim.supportsGestureDescription && options.gestureDescriptionHelpText ) {
      options.helpText = options.gestureDescriptionHelpText;
    }

    this.mutate( options );
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
  alertBothHandsObjectResponse() {
    this.objectResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse();
    phet.joist.sim.utteranceQueue.addToBack( this.objectResponseUtterance );
  }

  /**
   * @private
   * @param {TickMarkView} tickMarkView
   */
  alertBothHandsContextResponse( tickMarkView ) {
    this.contextResponseUtterance.alert = this.bothHandsDescriber.getBothHandsContextResponse();
    phet.joist.sim.utteranceQueue.addToBack( this.contextResponseUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;