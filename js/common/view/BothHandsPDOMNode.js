// Copyright 2020, University of Colorado Boulder

/**
 * PDOM view for interacting with both hands at the same time. This adds a custom interaction, as well as PDOM formatting
 * like adding the "application" role to support alternative input.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

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
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
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
   * @param {Object} [options]
   */
  constructor( numeratorProperty, denominatorProperty, valueRange, firstInteractionProperty, keyboardStep,
               tickMarkViewProperty, tickMarkRangeProperty, unclampedFitnessProperty, handPositionsDescriber,
               ratioDescriber, bothHandsDescriber, viewSounds, options ) {

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

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    interactiveNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( interactiveNode, numeratorProperty,
      denominatorProperty, valueRange, firstInteractionProperty, tickMarkRangeProperty, keyboardStep,
      viewSounds.boundarySoundClip, viewSounds.tickMarkBumpSoundClip );
    interactiveNode.addInputListener( ratioInteractionListener );

    interactiveNode.addInputListener( {
      focus: () => {
        this.alertBothHandsObjectResponse( tickMarkViewProperty.value ),
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

    // Only change these when fitness changes, even though it depends on other Properties.
    unclampedFitnessProperty.lazyLink( () => {
      const tickMarkView = tickMarkViewProperty.value;
      const isBeingInteractedWith = ratioInteractionListener.isBeingInteractedWithProperty.value;

      // TODO: do we want to add conditional direction addition here? (not currently implemented, see getBothHandsDistanceOrDirection()) https://github.com/phetsims/ratio-and-proportion/issues/207
      dynamicDescription.innerContent = handPositionsDescriber.getBothHandsDistance( tickMarkView );

      if ( isBeingInteractedWith ) {
        this.alertBothHandsObjectResponse( tickMarkView );

        contextResponseUtterance.alert = bothHandsDescriber.getBothHandsContextResponse();
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
    this.objectResponseUtterance.alert = this.bothHandsDescriber.getBothHandsObjectResponse( tickMarkView );
    phet.joist.sim.utteranceQueue.addToBack( this.objectResponseUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;