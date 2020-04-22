import { Injectable, Inject, NgZone } from '@angular/core';
import {
  Batch, Course, CourseService, EnrollCourseRequest,
  InteractType, AuthService, SharedPreferences, OAuthSession,
  FetchEnrolledCourseRequest, TelemetryObject, HttpClientError, NetworkError
} from 'sunbird-sdk';
import { Observable } from 'rxjs';
import { AppGlobalService } from './app-global-service.service';
import { TelemetryGeneratorService } from './telemetry-generator.service';
import { Environment, InteractSubtype, PageId } from './telemetry-constants';
import { Map } from '@app/app/telemetryutil';
import { CommonUtilService } from './common-util.service';
import { EnrollCourse } from './../app/enrolled-course-details-page/course.interface';
import { map, catchError } from 'rxjs/operators';
import { PreferenceKey, EventTopics, RouterLinks } from '@app/app/app.constant';
import { Events } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ContentUtil } from '@app/util/content-util';
import { Location } from '@angular/common';
import { Router } from '@angular/router';


@Injectable()
export class LocalCourseService {
  private userId: string;

  constructor(
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private events: Events,
    private zone: NgZone,
    private appVersion: AppVersion,
    private router: Router,
    private location: Location
  ) {
  }

  enrollIntoBatch(enrollCourse: EnrollCourse): Observable<any> {
    const enrollCourseRequest: EnrollCourseRequest = this.prepareEnrollCourseRequest(
      enrollCourse.userId, enrollCourse.batch, enrollCourse.courseId);
    return this.courseService.enrollCourse(enrollCourseRequest).pipe(
      map((data: boolean) => {
        if (data) {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.ENROLL_SUCCESS,
            Environment.HOME,
            enrollCourse.pageId, enrollCourse.telemetryObject,
            this.prepareRequestValue(enrollCourseRequest),
            enrollCourse.objRollup,
            enrollCourse.corRelationList
          );
        } else {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.ENROLL_FAILED,
            Environment.HOME,
            enrollCourse.pageId, enrollCourse.telemetryObject,
            this.prepareRequestValue(enrollCourseRequest),
            enrollCourse.objRollup,
            enrollCourse.corRelationList
          );
        }
        return data;
      }),
      catchError(err => {
        const requestValue = this.prepareRequestValue(enrollCourseRequest);
        if (err instanceof NetworkError) {
          requestValue.error = err.code;
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
        } else if (err instanceof HttpClientError) {
          if (err.response.body && err.response.body.params && err.response.body.params.status === 'USER_ALREADY_ENROLLED_COURSE') {
            requestValue.error = err.response.body.params.status;
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ALREADY_ENROLLED_COURSE'));
          } else {
            this.commonUtilService.showToast('ERROR_WHILE_ENROLLING_COURSE');
          }
        }
        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.OTHER,
          InteractSubtype.ENROLL_FAILED,
          Environment.HOME,
          enrollCourse.pageId, enrollCourse.telemetryObject,
          requestValue,
          enrollCourse.objRollup,
          enrollCourse.corRelationList
        );
        throw err;
      })
    );
  }

  prepareEnrollCourseRequest(userId: string, batch: Batch | any, courseId?: string): EnrollCourseRequest {
    const enrollCourseRequest: EnrollCourseRequest = {
      batchId: batch.id,
      courseId: batch.courseId || courseId,
      userId,
      batchStatus: batch.status
    };
    return enrollCourseRequest;
  }
  prepareRequestValue(enrollCourseRequest): Map {
    const reqvalues = new Map();
    reqvalues['enrollReq'] = enrollCourseRequest;
    return reqvalues;
  }

  // This method is called when the user login immediately after pressing JOIN TRAINING from app-components
  // And after filling signinOnboarding completely from externalId service.
  async checkCourseRedirect() {
    const isloggedInUser = await this.authService.getSession().toPromise();
    if (!this.appGlobalService.isSignInOnboardingCompleted && isloggedInUser) {
      this.appGlobalService.isJoinTraningOnboardingFlow = true;
      return;
    }
    const batchDetails = await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise();
    const courseDetail = await this.preferences.getString(PreferenceKey.COURSE_DATA_KEY).toPromise();
    if (batchDetails && courseDetail) {
      const session: OAuthSession = await this.authService.getSession().toPromise();
      let isGuestUser;
      if (!session) {
        isGuestUser = true;
      } else {
        isGuestUser = false;
        this.userId = session.userToken;
      }
      if (JSON.parse(courseDetail).createdBy !== this.userId && !isGuestUser) {
        this.enrollBatchAfterlogin(JSON.parse(batchDetails), JSON.parse(courseDetail));
      } else {
        this.events.publish('return_course');
      }
      this.preferences.putString(PreferenceKey.BATCH_DETAIL_KEY, '').toPromise();
    }
  }

  private async enrollBatchAfterlogin(batch: Batch, course: any) {
    const enrollCourseRequest = this.prepareEnrollCourseRequest(this.userId, batch);
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const telemetryObject: TelemetryObject = ContentUtil.getTelemetryObject(course);
    const corRelationList = await this.preferences.getString(PreferenceKey.CDATA_KEY).toPromise();
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.TOUCH,
      InteractSubtype.ENROLL_CLICKED,
      Environment.HOME,
      PageId.COURSE_BATCHES, telemetryObject,
      this.prepareRequestValue(enrollCourseRequest),
      ContentUtil.generateRollUp(undefined, telemetryObject.id),
      corRelationList ? JSON.parse(corRelationList) : []);

    const enrollCourse: EnrollCourse = {
      userId: this.userId,
      batch,
      pageId: PageId.COURSE_BATCHES,
      telemetryObject,
      objRollup: ContentUtil.generateRollUp(undefined, telemetryObject.id),
      corRelationList: corRelationList ? JSON.parse(corRelationList) : []
    };
    this.enrollIntoBatch(enrollCourse).toPromise()
      .then(() => {
        this.zone.run(async () => {
          await loader.dismiss();
          this.commonUtilService.showToast(this.commonUtilService.translateMessage('COURSE_ENROLLED'));
          this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
            batchId: batch.id,
            courseId: batch.courseId
          });
          const appLabel = await this.appVersion.getAppName();
          this.events.publish(EventTopics.COACH_MARK_SEEN, { showWalkthroughBackDrop: false, appName: appLabel });
          await this.preferences.putString(PreferenceKey.CDATA_KEY, '').toPromise();
          this.getEnrolledCourses();
          this.navigateTocourseDetails();
        });
      }, (err) => {
        this.zone.run(async () => {
          await loader.dismiss();
          await this.preferences.putString(PreferenceKey.CDATA_KEY, '').toPromise();
          if (err instanceof NetworkError) {
            this.commonUtilService.showToast(this.commonUtilService.translateMessage('ERROR_NO_INTERNET_MESSAGE'));
            this.getEnrolledCourses();
          } else if (err instanceof HttpClientError) {
            if (err.response.body && err.response.body.params && err.response.body.params.status === 'USER_ALREADY_ENROLLED_COURSE') {
              this.events.publish(EventTopics.ENROL_COURSE_SUCCESS, {
                batchId: batch.id,
                courseId: batch.courseId
              });
            } else {
              this.commonUtilService.showToast('ERROR_WHILE_ENROLLING_COURSE');
            }
          }
          this.navigateTocourseDetails();
        });
      });
  }

  navigateTocourseDetails() {
    const routeUrl = this.router.url;
    if ((routeUrl.indexOf(RouterLinks.ENROLLED_COURSE_DETAILS) === -1) && (routeUrl.indexOf(RouterLinks.COURSE_BATCHES) !== -1)) {
      this.location.back();
    }
  }

  private async getEnrolledCourses(returnRefreshedCourses: boolean = false) {
    const loader = await this.commonUtilService.getLoader();
    await loader.present();
    const option: FetchEnrolledCourseRequest = {
      userId: this.userId,
      returnFreshCourses: returnRefreshedCourses
    };
    this.courseService.getEnrolledCourses(option).toPromise()
      .then(async (enrolledCourses) => {
        await loader.dismiss();
        if (enrolledCourses) {
          this.zone.run(() => {
            enrolledCourses = enrolledCourses || [];
            if (enrolledCourses.length > 0) {
              const courseList: Array<Course> = [];
              for (const course of enrolledCourses) {
                courseList.push(course);
              }
              this.appGlobalService.setEnrolledCourseList(courseList);
              this.preferences.putString(PreferenceKey.COURSE_DATA_KEY, '').toPromise();
            }
          });
        }
      }, async (err) => {
        await loader.dismiss();
      });
  }

  getEnrolledCourseSectionHTMLData(content) {
    let sectionHtml = '';
    if (content && content.batch && content.batch.endDate && content.completionPercentage &&
      String(content.completionPercentage) !== '100') {
      const endDate = new Date(content.batch.endDate);
      const dateVal = this.commonUtilService.getFormattedDate(content.batch.endDate);
      let message = '';
      let styleClass = '';

      if (endDate && endDate < new Date()) {
        message = this.commonUtilService.translateMessage('COURSE_ENDED_ON', dateVal);
        styleClass = 'card-section-danger';
      } else {
        message = this.commonUtilService.translateMessage('COMPLETE_BY', dateVal);
        styleClass = 'card-section-secondary';
      }
      sectionHtml = this.courseSectionHtml(message, styleClass);
    } else {
      sectionHtml = this.courseSectionHtml('', '');
    }
    return sectionHtml;
  }

  getCourseSectionHTMLData(content) {
    let sectionHtml = '';
    if (content.batches && content.batches.length === 1 && content.batches[0].enrollmentEndDate) {
      const endDate = new Date(content.batches[0].enrollmentEndDate);
      const dateVal = this.commonUtilService.getFormattedDate(content.batches[0].enrollmentEndDate);
      let message = '';
      let styleClass = '';

      if (endDate && endDate < new Date()) {
        message = this.commonUtilService.translateMessage('COURSE_ENDED', dateVal);
        styleClass = 'card-section-danger';
      } else {
        message = this.commonUtilService.translateMessage('LAST_DATE_TO_JOIN', dateVal);
        styleClass = 'card-section-secondary';
      }
      sectionHtml = this.courseSectionHtml(message, styleClass);
    } else {
      sectionHtml = this.courseSectionHtml('', '');
    }
    return sectionHtml;
  }

  private courseSectionHtml(message, styleClass) {
    let htmlText = '';
    if (message === '') {
      htmlText =
      `<div class="card-section-invisible">
        <img src="assets/imgs/ic_info.svg">
      </div>`;
    } else {
      htmlText =
      `<div class="${styleClass}">
        <img src="assets/imgs/ic_info.svg">
        <span> ${message}</span>
      </div>`;
    }
    return htmlText;
  }
}
