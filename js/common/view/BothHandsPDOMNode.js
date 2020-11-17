// Copyright 2020, University of Colorado Boulder

/**
 * PDOM view for interacting with both hands at the same time. This adds a custom interaction, as well as PDOM formatting
 * like adding the "application" role to support alternative input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import AriaHerald from '../../../../utterance-queue/js/AriaHerald.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import RatioInteractionListener from './RatioInteractionListener.js';

class BothHandsPDOMNode extends Node {

  /**
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Range} valueRange - the total range of the hand
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {number} keyboardStep
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {Property.<number>} unclampedFitnessProperty
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {RatioDescriber} ratioDescriber
   * @param {BothHandsDescriber} bothHandsDescriber
   * @param {ViewSounds} viewSounds
   * @param {BooleanProperty} ratioLockedProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {function(RatioComponent):number} getIdealTerm
   * @param {Object} [options]
   */
  constructor( ratioTupleProperty, valueRange, firstInteractionProperty, keyboardStep,
               tickMarkViewProperty, tickMarkRangeProperty, unclampedFitnessProperty, handPositionsDescriber,
               ratioDescriber, bothHandsDescriber, viewSounds, ratioLockedProperty, targetRatioProperty, getIdealTerm, options ) {

    options = merge( {
      tagName: 'div',
      helpText: ratioAndProportionStrings.a11y.bothHands.bothHandsHelpText,

      interactiveNodeOptions: {
        ariaRole: 'application',
        focusable: true,
        tagName: 'div',
        innerContent: ratioAndProportionStrings.a11y.bothHands.bothHands,
        ariaLabel: ratioAndProportionStrings.a11y.bothHands.bothHands
      }
    }, options );

    super();

    // @private
    this.handPositionsDescriber = handPositionsDescriber;
    this.bothHandsDescriber = bothHandsDescriber;
    this.ratioLockedProperty = ratioLockedProperty;

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    interactiveNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( interactiveNode, ratioTupleProperty, valueRange,
      firstInteractionProperty, tickMarkRangeProperty, keyboardStep,
      viewSounds.boundarySoundClip, viewSounds.tickMarkBumpSoundClip, ratioLockedProperty, targetRatioProperty, getIdealTerm );
    interactiveNode.addInputListener( ratioInteractionListener );

    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( tickMarkViewProperty.value );
        viewSounds.grabSoundClip.play();
      },
      blur: () => {
        viewSounds.releaseSoundClip.play();
      }
    } );

    // @private
    this.objectResponseUtterance = new Utterance( {
      alertStableDelay: RAPQueryParameters.bothHandsObjectDelay,
      announcerOptions: {

        // This "object response" is meant to act more like aria-valuetext than a traditional, polite alert. We want
        // this to cut off any other alert. This fixes alert-build-up described in https://github.com/phetsims/ratio-and-proportion/issues/214
        ariaLivePriority: AriaHerald.AriaLive.ASSERTIVE
      }
    } );
    const contextResponseUtterance = new Utterance( { alertStableDelay: RAPQueryParameters.bothHandsContextDelay } );

    // @public (read-only) - expose this from the listener for general consumption
    this.isBeingInteractedWithProperty = ratioInteractionListener.isBeingInteractedWithProperty;

    // Though most cases are covered by just listening to fitness, there are certain cases when Property values can change,
    // but the fitness doesn't. See https://github.com/phetsims/ratio-and-proportion/issues/222 as an example.
    Property.multilink( [ ratioTupleProperty, unclampedFitnessProperty ], () => {
      const tickMarkView = tickMarkViewProperty.value;
      const isBeingInteractedWith = ratioInteractionListener.isBeingInteractedWithProperty.value;

      dynamicDescription.innerContent = handPositionsDescriber.getBothHandsDistance( tickMarkView );

      if ( isBeingInteractedWith ) {
        this.alertBothHandsObjectResponse( tickMarkView );

        contextResponseUtterance.alert = bothHandsDescriber.getBothHandsContextResponse( ratioLockedProperty.value );
        phet.joist.sim.utteranceQueue.addToBack( contextResponseUtterance );
      }
    } );

    this.mutate( options );
  }

  /**
   * @private
   * @param {TickMarkView} tickMarkView
   */
  alertBothHandsObjectResponse( tickMarkView ) {
    this.objectResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse( tickMarkView, this.ratioLockedProperty.value );
    phet.joist.sim.utteranceQueue.addToBack( this.objectResponseUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;