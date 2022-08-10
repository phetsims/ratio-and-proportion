// Copyright 2022, University of Colorado Boulder

/**
 * Options used by the sim that the user can change in the Preferences Dialog.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { Node, VBox } from '../../../../scenery/js/imports.js';
import MediaPipeQueryParameters from '../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPMediaPipe from './RAPMediaPipe.js';

class SimControlsNode extends VBox {

  public constructor() {

    const mediaPipeNode = MediaPipeQueryParameters.cameraInput === 'hands' ? RAPMediaPipe.getMediaPipeOptionsNode() : new Node();
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