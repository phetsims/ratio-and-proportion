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

    const ratioInteractionListener = new RatioInteractionListener( interactiveNode, numeratorProperty,
      denominatorProperty, valueRange, firstInteractionProperty, tickMarkRangeProperty, keyboardStep );
    interactiveNode.addInputListener( ratioInteractionListener );

    const bothHandsRatioUtterance = new Utterance( {

      // a longer delay before speaking the bothHandsPositionUtterance gives
      // more consistent behavior on Safari, where often the alerts would be
      // lost
      alertStableDelay: 1000
    } );

    Property.multilink( [
        ratioInteractionListener.isBeingInteractedWithProperty,
        tickMarkViewProperty,
        unclampedFitnessProperty ], // use unclamped so that it changes with any change to the model.
      ( isBeingInteractedWith, tickMarkView ) => {

        // By clearing it out first, we increase the likelyhood that description will be repeated when it hasn't changed.
        // This is the same strategy as https://github.com/phetsims/utterance-queue/blob/b275895573d6c878faa2e61b7f27305b901d3939/js/AriaHerald.js#L103-L105
        dynamicDescription.innerContent = '';
        dynamicDescription.innerContent = handPositionsDescriber.getBothHandsDistance( tickMarkView );

        if ( isBeingInteractedWith ) {
          bothHandsRatioUtterance.alert = bothHandsDescriber.getRatioAndBothHandPositionsText();
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