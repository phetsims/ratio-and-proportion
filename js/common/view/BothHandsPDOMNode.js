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
import Node from '../../../../scenery/js/nodes/Node.js';
import AriaHerald from '../../../../utterance-queue/js/AriaHerald.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import BothHandsInteractionListener from './BothHandsInteractionListener.js';

class BothHandsPDOMNode extends Node {

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {CueArrowsState} cueArrowsState
   * @param {number} keyboardStep
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {Property.<number>} unclampedFitnessProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {BothHandsDescriber} bothHandsDescriber
   * @param {ViewSounds} viewSounds
   * @param {BooleanProperty} ratioLockedProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {function(RatioTerm):number} getIdealTerm
   * @param {Object} [options]
   */
  constructor( ratioTupleProperty,
               cueArrowsState,
               keyboardStep,
               tickMarkViewProperty,
               tickMarkRangeProperty,
               unclampedFitnessProperty,
               ratioDescriber,
               bothHandsDescriber,
               viewSounds,
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
      helpText: ratioAndProportionStrings.a11y.bothHands.bothHandsHelpText, // overridden by options.gestureDescriptionHelpText when supported
      interactiveNodeOptions: {
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
    this.bothHandsInteractionListener = new BothHandsInteractionListener( interactiveNode, ratioTupleProperty,
      this.antecedentInteractedWithProperty, this.consequentInteractedWithProperty, tickMarkRangeProperty, keyboardStep,
      viewSounds.boundarySoundClip, viewSounds.tickMarkBumpSoundClip, ratioLockedProperty, targetRatioProperty, getIdealTerm, {
        onInput: () => {
          this.alertBothHandsContextResponse();
        }
      } );
    interactiveNode.addInputListener( this.bothHandsInteractionListener );

    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( tickMarkViewProperty.value );
        viewSounds.grabSoundClip.play();
        this.bothHandsFocusedProperty.value = true;
      },
      blur: () => {
        viewSounds.releaseSoundClip.play();
        this.bothHandsFocusedProperty.value = false;

        // This only works because the bothHandsInteractionListener needs alt-input control resetting
        this.bothHandsInteractionListener.reset();
      }
    } );

    // @private
    this.objectResponseUtterance = new Utterance( {
      alertStableDelay: 500,
      announcerOptions: {

        // This "object response" is meant to act more like aria-valuetext than a traditional, polite alert. We want
        // this to cut off any other alert. This fixes alert-build-up described in https://github.com/phetsims/ratio-and-proportion/issues/214
        ariaLivePriority: AriaHerald.AriaLive.ASSERTIVE
      }
    } );

    // @private
    this.contextResponseUtterance = new Utterance( { alertStableDelay: 2000 } );

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
      phet.joist.sim.utteranceQueue.addToBack( ratioAndProportionStrings.a11y.lockRatioCheckboxUnlockedContextResponse );
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