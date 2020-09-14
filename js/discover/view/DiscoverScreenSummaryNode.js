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

class DiscoverScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} numeratorProperty
   * @param {Property.<number>} denominatorProperty
   * @param {Property.<number>} targetRatioProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Map.<number,string>} ratioToChallengeNameMap - map from target ratio to name of challenge
   */
  constructor( ratioFitnessProperty, numeratorProperty, denominatorProperty, targetRatioProperty, tickMarkViewProperty,
               ratioDescriber, handPositionsDescriber, ratioToChallengeNameMap ) {

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
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.introParagraph
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
    Property.multilink( [ targetRatioProperty, tickMarkViewProperty, ratioFitnessProperty, numeratorProperty, denominatorProperty ],
      ( currentTargetRatio, tickMarkView ) => {
        stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.discover.screenSummary.qualitativeStateOfSim, {
          ratioFitness: ratioDescriber.getRatioFitness( false ), // lowercase
          currentChallenge: ratioToChallengeNameMap.get( currentTargetRatio ).lowercase,
          distance: handPositionsDescriber.getDistanceRegion( true )
        } );
        leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
          position: handPositionsDescriber.getHandPosition( numeratorProperty, tickMarkView )
        } );
        rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
          position: handPositionsDescriber.getHandPosition( denominatorProperty, tickMarkView )
        } );
      } );
  }
}

ratioAndProportion.register( 'DiscoverScreenSummaryNode', DiscoverScreenSummaryNode );
export default DiscoverScreenSummaryNode;