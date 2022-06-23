// Copyright 2022, University of Colorado Boulder

/**
 * To test connecting to a bluetooth device using web bluetooth. Note this uses Promises (as the
 * bluetooth API works with promises) which is very unusual for simulation code.
 *
 * Prototype code for upcoming student studies, see https://github.com/phetsims/ratio-and-proportion/issues/473
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Property from '../../../../axon/js/Property.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import RatioTerm from '../model/RatioTerm.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StationaryValueTracker from './StationaryValueTracker.js';

const FONT = new PhetFont( { size: 16, weight: 'bold' } );

// in ms
const TIME_INTERACTED_WITH_MEMORY = 2000;

class RatioAndProportionBluetoothButton extends TextPushButton {

  public isBeingInteractedWithProperty = new BooleanProperty( false );
  private lastTimeInteractedWith = 0;
  private stationaryTracker = new StationaryValueTracker();
  public isStationaryProperty = this.stationaryTracker.isStationaryProperty; // pull it out for the public API

  public constructor( tupleProperty: Property<RAPRatioTuple>, ratioTerm: RatioTerm ) {

    // TODO: Handle when device does not support bluetooth with bluetooth.getAvailability. https://github.com/phetsims/ratio-and-proportion/issues/473
    // TODO: Handle when browser does not support bluetooth, presumablue !navigator.bluetooth https://github.com/phetsims/ratio-and-proportion/issues/473

    // Name provided by the bluetooth device creator
    const deviceName = ratioTerm === RatioTerm.ANTECEDENT ? 'nrf52L' : 'nrf52R';

    // button label
    const labelString = StringUtils.fillIn( 'BLE {{side}} device', {
      side: ratioTerm === RatioTerm.ANTECEDENT ? 'left' : 'right'
    } );

    // decides which hand to control in the sim
    const term = ratioTerm === RatioTerm.ANTECEDENT ? 'withAntecedent' : 'withConsequent';

    super( labelString, {
      textNodeOptions: { font: FONT },
      listener: async () => {
        await this.requestDevice( { filters: [ { name: deviceName } ], optionalServices: [ 0xae6f ] }, tupleProperty, term );
      }
    } );
  }

  private async requestDevice( bluetoothConfig: any, tupleProperty: Property<RAPRatioTuple>, term: string ): Promise<void> {
    let device: null | any; // should be type BluetoothDevice, but it is too experimental for native types

    // @ts-ignore - navigator.bluetooth is experimental and does not exist in the typing
    if ( navigator.bluetooth ) {

      // @ts-ignore - navigator.bluetooth is experimental and does not exist in the typing
      device = await navigator.bluetooth.requestDevice( bluetoothConfig ).catch( err => {
        device = null;
      } );

      if ( device ) {
        console.log( device.name );
        console.log( device.id );

        // attempt to connect to the GATT Server.
        const gattServer = await device.gatt.connect().catch( ( err: DOMException ) => { console.error( err ); } );
        const primaryService = await gattServer.getPrimaryService( 0xae6f ).catch( ( err: DOMException ) => { console.error( err ); } );
        const characteristic = await primaryService.getCharacteristic( 0x2947 ).catch( ( err: DOMException ) => { console.error( err ); } );
        const notifySuccess = await characteristic.startNotifications().catch( ( err: DOMException ) => { console.error( err ); } );
        notifySuccess.addEventListener( 'characteristicvaluechanged', ( event: any ) => {
          this.isBeingInteractedWithProperty.value = true;
          this.lastTimeInteractedWith = Date.now();

          const newValue = RatioAndProportionBluetoothButton.handleCharacteristicValueChanged( event );

          // Keep track of values to see if the current position over time is considered "stationary"
          this.stationaryTracker.update( newValue );

          // @ts-ignore
          tupleProperty.value = tupleProperty.value[ term ]( newValue );
        } );

        // At this time we can assume that connections are successful
        console.log( 'connection successful' );
      }
    }
  }

  step(): void {
    if ( Date.now() - this.lastTimeInteractedWith > TIME_INTERACTED_WITH_MEMORY ) {
      this.isBeingInteractedWithProperty.value = false;
    }
  }

  /**
   * Respond to a characteristicvaluechanged event.
   * TODO: Implement this function. This is the main event we get when we receive new data from the device. https://github.com/phetsims/ratio-and-proportion/issues/473
   * The return value must be between 0 and 1.
   */
  private static handleCharacteristicValueChanged( event: Event ): number {
    if ( event.target ) {

      // @ts-ignore
      // console.log( event.target.value.getUint8( 0 ) );
      console.log( event.target.value.getFloat32( 0, true ) );

      // @ts-ignore
      let floatValue = event.target.value.getFloat32( 0, true );
      floatValue = Utils.toFixed( floatValue, 4 ); //rounding to 4 decimal places.

      return Utils.clamp( floatValue / 100, 0, 1 );
    }

    return 0;
  }
}

ratioAndProportion.register( 'RatioAndProportionBluetoothButton', RatioAndProportionBluetoothButton );
export default RatioAndProportionBluetoothButton;
