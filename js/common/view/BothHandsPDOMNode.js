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
import PDOMPeer from '../../../../scenery/js/accessibility/pdom/PDOMPeer.js';
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
   * @param {Property.<number>} unclampedFitnessProperty
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {RatioDescriber} ratioDescriber
   * @param {Object} [options]
   */
  constructor( leftValueProperty, rightValueProperty, valueRange, firstInteractionProperty, keyboardStep,
               tickMarkViewProperty, tickMarkRangeProperty, unclampedFitnessProperty, handPositionsDescriber,
               ratioDescriber, options ) {

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

    const interactiveNode = new Node( options.interactiveNodeOptions );
    this.addChild( interactiveNode );

    const dynamicDescription = new Node( { tagName: 'p' } );
    this.addChild( dynamicDescription );

    interactiveNode.addAriaDescribedbyAssociation( {
      otherNode: dynamicDescription,
      otherElementName: PDOMPeer.PRIMARY_SIBLING,
      thisElementName: PDOMPeer.PRIMARY_SIBLING
    } );

    interactiveNode.setAccessibleAttribute( 'aria-roledescription', sceneryPhetStrings.a11y.grabDrag.movable );

    const ratioInteractionListener = new RatioInteractionListener( interactiveNode, leftValueProperty,
      rightValueProperty, valueRange, firstInteractionProperty, tickMarkRangeProperty, keyboardStep );
    interactiveNode.addInputListener( ratioInteractionListener );

    const bothHandsRatioUtterance = new Utterance( {

      // a longer delay before speaking the bothHandsPositionUtterance gives
      // more consistent behavior on Safari, where often the alerts would be
      // lost
      alertStableDelay: 1000
    } );

    Property.multilink( [
        ratioInteractionListener.isBeingInteractedWithProperty,
        unclampedFitnessProperty, // use unclamped so that it changes with any change to the model.
        tickMarkViewProperty ],
      isBeingInteractedWith => {
        dynamicDescription.innerContent = '';
        dynamicDescription.innerContent = handPositionsDescriber.getBothHandsDistance( tickMarkViewProperty.value );
        if ( isBeingInteractedWith ) {
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