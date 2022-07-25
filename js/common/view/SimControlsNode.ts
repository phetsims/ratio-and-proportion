// Copyright 2022, University of Colorado Boulder

/**
 * Options used by the sim that the user can change in the Preferences Dialog.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Node, VBox } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import RAPMediaPipe from './RAPMediaPipe.js';

class SimControlsNode extends VBox {

  public constructor() {

    const mediaPipeNode = RAPQueryParameters.mediaPipe ? RAPMediaPipe.getMediaPipeOptionsNode() : new Node();
    super( {
        children: [
          mediaPipeNode
        ]
      }
    );
  }
}

ratioAndProportion.register( 'SimControlsNode', SimControlsNode );
export default SimControlsNode;