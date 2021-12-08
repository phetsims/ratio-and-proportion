// Copyright 2020-2021, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RAPRatioTuple from '../../common/model/RAPRatioTuple.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';

class DiscoverScreenSummaryNode extends Node {

  constructor( ratioFitnessProperty: IReadOnlyProperty<number>, ratioTupleProperty: Property<RAPRatioTuple>,
               targetRatioProperty: Property<number>, tickMarkViewProperty: Property<TickMarkView>,
               ratioDescriber: RatioDescriber, inProportionProperty: IReadOnlyProperty<boolean>, handPositionsDescriber: HandPositionsDescriber,
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
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph3
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
      ratioFitnessProperty,
      inProportionProperty
    ], ( currentTargetRatio: number, tickMarkView: TickMarkView, currentTuple: RAPRatioTuple, fitness: number, inProportion: boolean ) => {

            stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSim, {
        color: BackgroundColorHandler.getCurrentColorRegion( fitness, inProportion ),
        ratioFitness: ratioDescriber.getRatioFitness( false ),
        currentChallenge: ratioToChallengeNameMap.get( currentTargetRatio )!.lowercase,
        distance: handPositionsDescriber.getDistanceRegion( true )
      } );

            leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( currentTuple.antecedent, tickMarkView )
      } );

            rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( currentTuple.consequent, tickMarkView )
      } );
    } );
  }
}

ratioAndProportion.register( 'DiscoverScreenSummaryNode', DiscoverScreenSummaryNode );
export default DiscoverScreenSummaryNode;