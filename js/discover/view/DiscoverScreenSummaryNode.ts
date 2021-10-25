// Copyright 2020-2021, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RAPRatioTuple from '../../common/model/RAPRatioTuple.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import { TickMarkViewType } from '../../common/view/TickMarkView.js';

class DiscoverScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<RAPRatioTuple>} ratioTupleProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Map.<number,string>} ratioToChallengeNameMap - map from target ratio to name of challenge
   */
  constructor( ratioFitnessProperty: Property<number>, ratioTupleProperty: Property<RAPRatioTuple>,
               targetRatioProperty: Property<number>, tickMarkViewProperty: Property<TickMarkViewType>,
               ratioDescriber: RatioDescriber, handPositionsDescriber: HandPositionsDescriber,
               ratioToChallengeNameMap: Map<number, { lowercase: string, capitalized: string }> ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph1
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph2
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummaryControlAreaParagraph
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.interactionHint
        } )
      ]
    } );

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Property.multilink( [
      targetRatioProperty,
      tickMarkViewProperty,
      ratioTupleProperty,
      ratioFitnessProperty
    ], ( currentTargetRatio: number, tickMarkView: TickMarkViewType, currentTuple: RAPRatioTuple ) => {

      // @ts-ignore
      stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.discover.screenSummary.qualitativeStateOfSim, {
        ratioFitness: ratioDescriber.getRatioFitness( false ), // lowercase
        currentChallenge: ratioToChallengeNameMap.get( currentTargetRatio )!.lowercase,
        distance: handPositionsDescriber.getDistanceRegion( true )
      } );

      // @ts-ignore
      leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( currentTuple.antecedent, tickMarkView )
      } );

      // @ts-ignore
      rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( currentTuple.consequent, tickMarkView )
      } );
    } );
  }
}

ratioAndProportion.register( 'DiscoverScreenSummaryNode', DiscoverScreenSummaryNode );
export default DiscoverScreenSummaryNode;