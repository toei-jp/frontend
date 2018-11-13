/**
 * AwsCognitoService
 */
import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';
import { SaveType, StorageService } from '../storage/storage.service';

@Injectable()
export class AwsCognitoService {
    public static REGION: string = environment.COGNITO_REGION;
    public static IDENTITY_POOL_ID: string = environment.COGNITO_IDENTITY_POOL_ID;
    public static USER_POOL_ID: string = environment.COGNITO_USER_POOL_ID;
    public static CLIENT_ID: string = environment.COGNITO_CLIENT_ID;

    public credentials: AWS.CognitoIdentityCredentials;

    constructor(
        private storage: StorageService
    ) {
    }

    /**
     * 端末IDで認証
     * @method authenticateWithDeviceId
     * @returns {Promise<void>}
     */
    public async authenticateWithDeviceId(deviceId?: string): Promise<void> {
        if (this.isAuthenticate()) {
            return;
        }
        AWS.config.region = AwsCognitoService.REGION;
        if (deviceId !== undefined) {
            this.storage.save('device', { id: deviceId }, SaveType.Session);
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: AwsCognitoService.IDENTITY_POOL_ID,
                IdentityId: deviceId
            });
        } else {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: AwsCognitoService.IDENTITY_POOL_ID
            });
        }
        this.credentials = (<AWS.CognitoIdentityCredentials>AWS.config.credentials);
        await this.credentials.getPromise();
    }

    /**
     * 認証確認
     * @method isAuthenticate
     * @returns {boolean}
     */
    public isAuthenticate(): boolean {
        return (this.credentials !== undefined
            && this.credentials.identityId !== undefined
            && this.credentials.identityId.length > 0);
    }

    /**
     * レコード更新
     * @param {string} datasetName
     * @param {value} value
     * @returns {Promise<any>}
     */
    public async updateRecords(args: {
        datasetName: string;
        value: any;
    }): Promise<any> {
        if (this.credentials === undefined) {
            throw new Error('credentials is undefined');
        }
        await this.credentials.getPromise();
        const cognitoSync = new AWS.CognitoSync({
            credentials: this.credentials
        });
        const listRecords = await cognitoSync.listRecords({
            DatasetName: args.datasetName,
            IdentityId: this.credentials.identityId,
            IdentityPoolId: AwsCognitoService.IDENTITY_POOL_ID,
            LastSyncCount: 0
        }).promise();
        if (listRecords.DatasetSyncCount === undefined
            || listRecords.SyncSessionToken === undefined) {
            throw new Error('listRecords: Records or DatasetSyncCount or SyncSessionToken is undefined');
        }
        if (listRecords.Records === undefined) {
            listRecords.Records = [];
        }
        args.value.updateAt = moment().toISOString();
        const mergeValue = this.convertToObjects(listRecords.Records);
        Object.assign(mergeValue, args.value);

        const updateRecords = await cognitoSync.updateRecords({
            DatasetName: args.datasetName,
            IdentityId: this.credentials.identityId,
            IdentityPoolId: AwsCognitoService.IDENTITY_POOL_ID,
            SyncSessionToken: listRecords.SyncSessionToken,
            RecordPatches: this.convertToRecords(mergeValue, listRecords.DatasetSyncCount)
        }).promise();
        if (updateRecords.Records === undefined) {
            updateRecords.Records = [];
        }

        return this.convertToObjects(updateRecords.Records);
    }

    /**
     * レコード取得
     * @param {string} datasetName
     * @returns {Promise<any>}
     */
    public async getRecords(args: { datasetName: string; }): Promise<any> {
        if (this.credentials === undefined) {
            throw new Error('credentials is undefined');
        }
        await this.credentials.getPromise();
        const cognitoSync = new AWS.CognitoSync({
            credentials: this.credentials
        });
        const listRecords = await cognitoSync.listRecords({
            DatasetName: args.datasetName,
            IdentityId: this.credentials.identityId,
            IdentityPoolId: AwsCognitoService.IDENTITY_POOL_ID,
            LastSyncCount: 0
        }).promise();
        if (listRecords.Records === undefined) {
            listRecords.Records = [];
        }
        // console.log('getRecords', this.convertToObjects(listRecords.Records));

        return (<any>this.convertToObjects(listRecords.Records));
    }

    /**
     * レコードの形式へ変換
     * @param {any} value
     * @param {number} count
     * @returns {{ Key: string; Op: string; SyncCount: number; Value: string; }[]}
     */
    private convertToRecords(value: any, count: number): {
        Key: string;
        Op: string;
        SyncCount: number;
        Value: string;
    }[] {
        return Object.keys(value).map((key: string) => {
            return {
                Key: key,
                Op: 'replace',
                SyncCount: count,
                Value: JSON.stringify(value[key])
            };
        });
    }

    /**
     * オブジェクトの形式へ変換
     * @param {any[]} records
     * @param {number} count
     * @returns {Object}
     */
    private convertToObjects(records: any[]): Object {
        const result: any = {};
        records.forEach((record: {
            Key: string;
            Op: string;
            SyncCount: number;
            Value: string;
        }) => {
            result[record.Key] = JSON.parse(record.Value);
        });

        return result;
    }

}
