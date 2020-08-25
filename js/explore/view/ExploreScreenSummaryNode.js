// Copyright 2020, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class ExploreScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Map.<number,string>} ratioToChallengeNameMap - map from target ratio to name of challenge
   */
  constructor( ratioFitnessProperty, leftValueProperty, rightValueProperty, targetRatioProperty, gridViewProperty,
               ratioDescriber, handPositionsDescriber, ratioToChallengeNameMap ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const distanceBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet, distanceBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.explore.screenSummary.introParagraph
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.explore.screenSummary.interactionHint
        } )
      ]
    } );

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Property.multilink( [ targetRatioProperty, gridViewProperty, ratioFitnessProperty, leftValueProperty, rightValueProperty ],
      ( currentTargetRatio, gridView ) => {
        stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.explore.screenSummary.qualitativeStateOfSim, {
          ratioFitness: ratioDescriber.getRatioFitness( false ), // lowercase
          currentChallenge: ratioToChallengeNameMap.get( currentTargetRatio ).lowercase
        } );
        leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
          position: handPositionsDescriber.getHandPosition( leftValueProperty, gridView )
        } );
        rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
          position: handPositionsDescriber.getHandPosition( rightValueProperty, gridView )
        } );
        distanceBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.distanceBullet, {
          distance: handPositionsDescriber.getDistanceRegion( true )
        } );
      } );
  }
}

ratioAndProportion.register( 'ExploreScreenSummaryNode', ExploreScreenSummaryNode );
export default ExploreScreenSummaryNode;