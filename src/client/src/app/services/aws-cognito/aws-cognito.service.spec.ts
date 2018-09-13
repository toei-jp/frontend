// import * as AWS from 'aws-sdk';
// import { StorageService } from '../storage/storage.service';
// import { AwsCognitoService } from './aws-cognito.service';

// describe('AwsCognitoService', () => {
//     it('authenticateWithDeviceId', async () => {
//         spyOn(AWS, 'CognitoIdentityCredentials').and.returnValue({
//             getPromise: () => {
//                 return Promise.resolve({});
//             }
//         });
//         const storage = new StorageService();
//         const service = new AwsCognitoService(storage);
//         await service.authenticateWithDeviceId();
//         expect(service.credentials).not.toBeNull();
//     });

//     it('isAuthenticate 認証OK', async () => {
//         spyOn(AWS, 'CognitoIdentityCredentials').and.returnValue({
//             getPromise: () => {
//                 return Promise.resolve({});
//             },
//             identityId: '12345678'
//         });
//         const storage = new StorageService();
//         const service = new AwsCognitoService(storage);
//         await service.authenticateWithDeviceId();
//         expect(service.isAuthenticate()).toBeTruthy();
//     });

//     it('updateRecords', async () => {
//         spyOn(AWS, 'CognitoIdentityCredentials').and.returnValue({
//             getPromise: () => {
//                 return Promise.resolve();
//             }
//         });
//         spyOn(AWS, 'CognitoSync').and.returnValue({
//             listRecords: () => {
//                 return {
//                     promise: () => {
//                         return Promise.resolve({
//                             Records: [
//                                 { Key: 'string', Op: 'string', SyncCount: 0, Value: JSON.stringify({ test: 'string' }) }
//                             ]
//                         });
//                     }
//                 };
//             },
//             updateRecords: () => {
//                 return {
//                     promise: () => {
//                         return Promise.resolve({
//                             Records: [
//                                 { Key: 'string', Op: 'string', SyncCount: 0, Value: JSON.stringify({ test: 'string' }) }
//                             ]
//                         });
//                     }
//                 };
//             }
//         });
//         const storage = new StorageService();
//         const service = new AwsCognitoService(storage);
//         await service.authenticateWithDeviceId();
//         const updateRecords = await service.updateRecords({
//             datasetName: 'TEST',
//             value: {}
//         });
//         expect(updateRecords).toBeTruthy();
//     });

//     it('getRecords', async () => {
//         spyOn(AWS, 'CognitoIdentityCredentials').and.returnValue({
//             getPromise: () => {
//                 return Promise.resolve();
//             }
//         });
//         spyOn(AWS, 'CognitoSync').and.returnValue({
//             listRecords: () => {
//                 return {
//                     promise: () => {
//                         return Promise.resolve({
//                             Records: [
//                                 { Key: 'string', Op: 'string', SyncCount: 0, Value: JSON.stringify({ test: 'string' }) }
//                             ]
//                         });
//                     }
//                 };
//             }
//         });
//         const storage = new StorageService();
//         const service = new AwsCognitoService(storage);
//         await service.authenticateWithDeviceId();
//         const getRecords = await service.getRecords({
//             datasetName: 'TEST'
//         });
//         expect(getRecords).toBeTruthy();
//     });
// });
