
import { NgModule } from '@angular/core';
import { HanwinApiService } from './services/hanwin-api.service';
import { HanwinBaseRequest } from './apis/hanwin-base-request.api';

@NgModule({
  declarations: [HanwinBaseRequest],
  exports: [HanwinBaseRequest],
  providers: [HanwinApiService]
})
export class HanwinApiKitModule { }