// /**
//  * StorageService
//  */
// import { inject, TestBed } from '@angular/core/testing';
// import { SaveType, StorageService } from './storage.service';

// describe('StorageService', () => {
//     it('load localStorageから読み込み', async () => {
//         spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify({
//             test: 'test'
//         }));
//         const service = new StorageService();
//         const result = service.load('test');
//         expect(result.test).toEqual('test');
//     });

//     it('load sessionStorageから読み込み', async () => {
//         spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({
//             test: 'test'
//         }));
//         const service = new StorageService();
//         const result = service.load('test', SaveType.Session);
//         expect(result.test).toEqual('test');
//     });

//     it('save localStorageへ保存', async () => {
//         spyOn(localStorage, 'setItem').and.returnValue({});
//         const service = new StorageService();
//         service.save('test', {});
//         expect(localStorage.setItem).toHaveBeenCalled();
//     });

//     it('save sessionStorageへ保存', async () => {
//         spyOn(sessionStorage, 'setItem').and.returnValue({});
//         const service = new StorageService();
//         service.save('test', {}, SaveType.Session);
//         expect(sessionStorage.setItem).toHaveBeenCalled();
//     });

//     it('save 書き込み失敗', async () => {
//         spyOn(sessionStorage, 'setItem').and.throwError('書き込み失敗');
//         spyOn(localStorage, 'setItem').and.throwError('書き込み失敗');
//         const service = new StorageService();
//         try {
//             service.save('test', {});
//         } catch (err) {
//             expect(err);
//         }
//     });

//     it('remove localStorage削除', async () => {
//         spyOn(localStorage, 'removeItem').and.returnValue({});
//         const service = new StorageService();
//         service.remove('test');
//         expect(localStorage.removeItem).toHaveBeenCalled();
//     });

//     it('remove sessionStorage削除', async () => {
//         spyOn(sessionStorage, 'removeItem').and.returnValue({});
//         const service = new StorageService();
//         service.remove('test', SaveType.Session);
//         expect(sessionStorage.removeItem).toHaveBeenCalled();
//     });
// });
