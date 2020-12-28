// Copyright 2020, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in the Create screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class CreateScreenSummaryNode extends Node {

  // REVIEW: This is a ton of parameters, and seems like a good application of a "config" object.

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} antecedentProperty
   * @param {Property.<number>} consequentProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {MyChallengeAccordionBox} myChallengeAccordionBox
   */
  constructor( ratioFitnessProperty, antecedentProperty, consequentProperty, tickMarkViewProperty,
               ratioDescriber, handPositionsDescriber, tickMarkRangeProperty, myChallengeAccordionBox ) {

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

    myChallengeAccordionBox.expandedProperty.link( expanded => {
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
      tickMarkRangeProperty,
      ratioFitnessProperty,
      antecedentProperty,
      consequentProperty
    ], ( tickMarkView, targetAntecedent, targetConsequent ) => {
      stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.qualitativeStateOfSim, {
        ratioFitness: ratioDescriber.getRatioFitness( false ), // lowercase
        distance: handPositionsDescriber.getDistanceRegion( true )
      } );

      leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( antecedentProperty.value, tickMarkView )
      } );
      rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: handPositionsDescriber.getHandPositionDescription( consequentProperty.value, tickMarkView )
      } );

      currentChallengeBullet.innerContent = ratioDescriber.getCurrentChallengeSentence( targetAntecedent, targetConsequent );
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;