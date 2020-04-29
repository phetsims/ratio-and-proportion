// Copyright 2020, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class RatioAndProportionScreenSummaryNode extends Node {
  constructor() {
    super( {
      children: [ new Node( {
        tagName: 'p',
        innerContent: ratioAndProportionStrings.a11y.screenSummary.playAreaDescription
      } ), new Node( {
        tagName: 'p',
        innerContent: ratioAndProportionStrings.a11y.screenSummary.controlAreaDescription
      } ) ]
    } );
  }
}

ratioAndProportion.register( 'RatioAndProportionScreenSummaryNode', RatioAndProportionScreenSummaryNode );
export default RatioAndProportionScreenSummaryNode;