// Copyright 2020-2021, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in the Create screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RAPRatioTuple from '../../common/model/RAPRatioTuple.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import { TickMarkViewType } from '../../common/view/TickMarkView.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';

class CreateScreenSummaryNode extends Node {

  constructor( ratioFitnessProperty: Property<number>,
               ratioTupleProperty: Property<RAPRatioTuple>,
               tickMarkViewProperty: Property<TickMarkViewType>,
               ratioDescriber: RatioDescriber,
               inProportionProperty: Property<boolean>,
               handPositionsDescriber: HandPositionsDescriber,
               tickMarkRangeProperty: Property<number>,
               myChallengeAccordionBox: MyChallengeAccordionBox ) {

    const stateOfSimNode = new Node( { tagName: 'p' } );
    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const currentChallengeBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.paragraph1
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.paragraph2
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummaryControlAreaParagraph
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.interactionHint
        } )
      ]
    } );

    myChallengeAccordionBox.expandedProperty.link( ( expanded: boolean ) => {
      if ( expanded ) {
        descriptionBullets.addChild( currentChallengeBullet );
      }
      else if ( descriptionBullets.hasChild( currentChallengeBullet ) ) {
        descriptionBullets.removeChild( currentChallengeBullet );
      }
    } );

    Property.multilink( [
      tickMarkViewProperty,
      myChallengeAccordionBox.targetAntecedentProperty,
      myChallengeAccordionBox.targetConsequentProperty,
      ratioTupleProperty,
      ratioFitnessProperty,
      inProportionProperty,
      tickMarkRangeProperty
    ], ( tickMarkView: TickMarkViewType, targetAntecedent: number, targetConsequent: number,
         currentTuple: RAPRatioTuple, fitness: number, inProportion: boolean ) => {

      // @ts-ignore
      stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSim, {
        color: BackgroundColorHandler.getCurrentColorRegion( fitness, inProportion ),
        ratioFitness: ratioDescriber.getRatioFitness( false ),
        currentChallenge: ratioAndProportionStrings.a11y.create.challenge,
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

      // @ts-ignore
      currentChallengeBullet.innerContent = ratioDescriber.getCurrentChallengeSentence( targetAntecedent, targetConsequent );
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;