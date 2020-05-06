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

class RatioAndProportionScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} proportionFitnessProperty
   * @param {RatioDescriber} ratioDescriber
   */
  constructor( proportionFitnessProperty, leftValueProperty, rightValueProperty, ratioDescriber ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.playAreaDescription
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.controlAreaDescription
        } ),
        stateOfSimNode,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.simSpecificInteractionHint
        } )
      ]
    } );

    // @private
    this.ratioDescriber = ratioDescriber;

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Property.multilink( [ proportionFitnessProperty, leftValueProperty, rightValueProperty ], () => {
      stateOfSimNode.innerContent = this.getStateOfSimString( true );// TODO: support quantitative
    } );
  }

  /**
   * @param {boolean} qualitative - vs quantitative
   * @returns {string}
   */
  getStateOfSimString( qualitative ) {

    const string = qualitative ? ratioAndProportionStrings.a11y.screenSummary.qualitativeStateOfSim :
                   ratioAndProportionStrings.a11y.screenSummary.quantitativeStateOfSim;
    return StringUtils.fillIn( string, {
      leftPosition: this.ratioDescriber.getLeftPointerPosition( qualitative ),
      rightPosition: this.ratioDescriber.getLeftPointerPosition( qualitative ),
      ratioFitness: this.ratioDescriber.getRatioFitness()
    } );
  }
}

ratioAndProportion.register( 'RatioAndProportionScreenSummaryNode', RatioAndProportionScreenSummaryNode );
export default RatioAndProportionScreenSummaryNode;