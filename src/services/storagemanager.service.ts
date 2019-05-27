import { Injectable } from '@angular/core';

/**
 * DESCRIPTION:
 * StorageManagerService is used to store Key-Value pairs at the browsers localStorage.
 */

@Injectable({
    providedIn: 'root'
})
export class StorageManagerService {
    private storageAvailable = false;   // Stores wheater the localStorage API is supported
    constructor() {
        if (typeof Storage !== 'undefined') {
            this.storageAvailable = true;
        } else {
            alert(
                // tslint:disable-next-line:max-line-length
                'Your Browser does not support localStorage API. All settings data can only be stored for the current session. Please update or change your browser software.'
            );
        }
    }

    /**
     * Updates a excisting Key-Value pair or creats a new Key-Value pair at localStorage.
     * @param item Item-Key to set at localStorage
     * @param value Value (as string)
     * @returns result
     */
    public setItem(item: string, value: string): boolean {
        let returnval = false;
        if (this.storageAvailable) {
            returnval = true;
            localStorage.setItem(item, value);
        }
        return returnval;
    }

    /**
     * Returns a Item-Key from localStorage
     * @param item Item-Key to load from localStorage
     * @returns Item-Value
     */
    public getItem(item: string): any {
        let returnval: any;
        returnval = false;
        if (this.isStorageAvailable) {
            returnval = localStorage.getItem(item);
        }
        return returnval;
    }

    /**
     * Removes the given Item-Value-Pair from the localStorage
     * @param item Item-Key to remove from localStorage
     * @returns result
     */
    public removeItem(item: string): any {
        let returnval: any;
        returnval = false;
        if (this.isStorageAvailable) {
            returnval = true;
            localStorage.removeItem(item);
        }
        return returnval;
    }

    /**
     * Checks wheater the localStorage API is availabel
     * @returns result
    */
    public isStorageAvailable(): boolean {
        return this.storageAvailable;
    }
}
