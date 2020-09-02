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
   * @param {NumberProperty} leftValueProperty
   * @param {NumberProperty} rightValueProperty
   * @param {Range} valueRange - the total range of the hand
   * @param {Property.<boolean>} firstInteractionProperty - upon successful interaction, this will be marked as false
   * @param {number} keyboardStep
   * @param {EnumerationProperty.<TickMarkView>} tickMarkViewProperty
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {RatioDescriber} ratioDescriber
   * @param {Object} [options]
   */
  constructor( leftValueProperty, rightValueProperty, valueRange, firstInteractionProperty, keyboardStep,
               tickMarkViewProperty, tickMarkRangeProperty, handPositionsDescriber,
               ratioDescriber, options ) {

    options = merge( {
      ariaRole: 'application',
      focusable: true,
      containerTagName: 'div', // @zepumph thought this was a bit easier to navigate in the PDOM
      tagName: 'div',
      innerContent: ratioAndProportionStrings.a11y.bothHands,
      ariaLabel: ratioAndProportionStrings.a11y.bothHands,
      helpText: ratioAndProportionStrings.a11y.bothHandsHelpText
    }, options );

    super();

    this.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( this, leftValueProperty,
      rightValueProperty, valueRange, firstInteractionProperty, tickMarkRangeProperty, keyboardStep );
    this.addInputListener( ratioInteractionListener );

    const bothHandsPositionUtterance = new Utterance( {

      // give enough time for the user to stop interacting with te hands
      // before describing current positions, to prevent too many of these
      // from queuing up in rapid presses
      alertStableDelay: 500
    } );
    const bothHandsRatioUtterance = new Utterance( {

      // a longer delay before speaking the bothHandsPositionUtterance gives
      // more consistent behavior on Safari, where often the alerts would be
      // lost
      alertStableDelay: 1000
    } );
    ratioInteractionListener.isBeingInteractedWithProperty.lazyLink( isBeingInteractedWith => {

      // when no longer being interacted with, trigger an alert
      if ( !isBeingInteractedWith ) {
        bothHandsPositionUtterance.alert = handPositionsDescriber.getBothHandsPositionText( tickMarkViewProperty.value );
        phet.joist.sim.utteranceQueue.addToBack( bothHandsPositionUtterance );

        bothHandsRatioUtterance.alert = ratioDescriber.getRatioDescriptionString();
        phet.joist.sim.utteranceQueue.addToBack( bothHandsRatioUtterance );
      }
    } );

    // @public (read-only) - expose this from the listener for general consumption
    this.isBeingInteractedWithProperty = ratioInteractionListener.isBeingInteractedWithProperty;

    this.mutate( options );
  }
}

ratioAndProportion.register( 'BothHandsPDOMNode', BothHandsPDOMNode );
export default BothHandsPDOMNode;