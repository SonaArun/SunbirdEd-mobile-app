import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ObservationRoutingModule } from "./observation-routing.module";
import { ObservationHomeComponent } from "./observation-home/observation-home.component";
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from "../shared/shared.module";
import { ObservationDetailComponent } from "./observation-detail/observation-detail.component";
import { TranslateModule } from "@ngx-translate/core";
import { IonicModule } from "@ionic/angular";
import { ObservationService } from "./observation.service";
import { ObservationSubmissionComponent } from "./observation-submission/observation-submission.component";
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { LocalStorageService } from '../core';

@NgModule({
  declarations: [ObservationHomeComponent, ObservationDetailComponent, ObservationSubmissionComponent],
  imports: [
    CommonModule,
    ObservationRoutingModule,
    HttpClientModule, // TODO:Tremove after api integration
    TranslateModule.forChild(),
    SharedModule,
    IonicModule,
    FormsModule,
    CoreModule
  ],
  providers: [ObservationService,LocalStorageService],
})
export class ObservationModule {}
