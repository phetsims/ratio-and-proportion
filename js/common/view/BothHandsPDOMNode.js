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
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
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
   * @param {Object} [options]
   */
  constructor( numeratorProperty, denominatorProperty, valueRange, firstInteractionProperty, keyboardStep,
               tickMarkViewProperty, tickMarkRangeProperty, unclampedFitnessProperty, handPositionsDescriber,
               ratioDescriber, bothHandsDescriber, options ) {

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

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    interactiveNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( interactiveNode, numeratorProperty,
      denominatorProperty, valueRange, firstInteractionProperty, tickMarkRangeProperty, keyboardStep );
    interactiveNode.addInputListener( ratioInteractionListener );

    interactiveNode.addInputListener( {
      focus: () => this.alertDistanceChanged( tickMarkViewProperty.value )
    } );

    // @private
    this.distanceUtterance = new Utterance( {

      // give enough time for the user to stop interacting with te hands
      // before describing current positions, to prevent too many of these
      // from queuing up in rapid presses
      alertStableDelay: 500
    } );

    const ratioChangedUtterance = new Utterance( {

      // a longer delay before speaking the bothHandsPositionUtterance gives
      // more consistent behavior on Safari, where often the alerts would be
      // lost
      alertStableDelay: 1000
    } );

    // @public (read-only) - expose this from the listener for general consumption
    this.isBeingInteractedWithProperty = ratioInteractionListener.isBeingInteractedWithProperty;

    // Only change these when fitness changes, even though it depends on other Properties.
    unclampedFitnessProperty.lazyLink( () => {
      const tickMarkView = tickMarkViewProperty.value;
      const isBeingInteractedWith = ratioInteractionListener.isBeingInteractedWithProperty.value;
      dynamicDescription.innerContent = handPositionsDescriber.getBothHandsDistance( tickMarkView );

      if ( isBeingInteractedWith ) {
        this.alertDistanceChanged( tickMarkView );

        ratioChangedUtterance.alert = bothHandsDescriber.getRatioAndBothHandPositionsText();
        phet.joist.sim.utteranceQueue.addToBack( ratioChangedUtterance );
      }
    } );

    this.mutate( options );
  }

  /**
   * @private
   * @param {TickMarkView} tickMarkView
   */
  alertDistanceChanged( tickMarkView ) {
    this.distanceUtterance.alert = this.handPositionsDescriber.getBothHandsDistance( tickMarkView );
    phet.joist.sim.utteranceQueue.addToBack( this.distanceUtterance );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;