import {CoursesPage} from './courses.page';
import {FormAndFrameworkUtilService} from '../../services/formandframeworkutil.service';
import {AppVersion} from '@ionic-native/app-version/ngx';
import {NgZone} from '@angular/core';
import {SunbirdQRScanner} from '../../services/sunbirdqrscanner.service';
import {Events, PopoverController, ToastController} from '@ionic/angular';
import {AppGlobalService} from '../../services/app-global-service.service';
import {CourseUtilService} from '../../services/course-util.service';
import {CommonUtilService} from '../../services/common-util.service';
import {TelemetryGeneratorService} from '../../services/telemetry-generator.service';
import {Network} from '@ionic-native/network/ngx';
import {Router} from '@angular/router';
import {AppHeaderService} from '../../services/app-header.service';
import {Environment, InteractSubtype, InteractType, PageId} from '../../services/telemetry-constants';
import {
    Content,
    ContentService,
    Course,
    CourseBatchStatus,
    CourseEnrollmentType,
    CourseService,
    EventsBusService,
    FrameWorkService,
    PageAssembleCriteria,
    PageAssembleService,
    ProfileType,
    SharedPreferences
} from 'sunbird-sdk';
import {of, throwError} from 'rxjs';
import {BatchConstants, ContentCard, PageName} from '../app.constant';
import {LocalCourseService} from '../../services/local-course.service';
import {SbProgressLoader} from '../../services/sb-progress-loader.service';
import {CsNetworkError} from '@project-sunbird/client-services/core/http-service';

describe('CoursesPage', () => {
    let coursesPage: CoursesPage;
    const mockAppGlobalService: Partial<AppGlobalService> = {};
    const mockAppVersion: Partial<AppVersion> = {
        getAppName: jest.fn(() => Promise.resolve('sunbird'))
    };
    const mockCommonUtilService: Partial<CommonUtilService> = {};
    const mockContentService: Partial<ContentService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockFrameworkService: Partial<FrameWorkService> = {};
    const mockCourseUtilService: Partial<CourseUtilService> = {};
    const mockEventBusService: Partial<EventsBusService> = {};
    const mockEvents: Partial<Events> = {
        subscribe: jest.fn()
    };
    const mockFormAndFrameworkUtilService: Partial<FormAndFrameworkUtilService> = {};
    const mockHeaderService: Partial<AppHeaderService> = {};
    const mockNetwork: Partial<Network> = {};
    const mockNgZone: Partial<NgZone> = {
        run: jest.fn((fn) => fn())
    };
    const mockPageService: Partial<PageAssembleService> = {};
    const mockPopCtrl: Partial<PopoverController> = {};
    const mockPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of('{"body": {"identifier": "do_123"}}'))
    };
    const mockQrScanner: Partial<SunbirdQRScanner> = {};
    const mockRouter: Partial<Router> = {};
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateExtraInfoTelemetry: jest.fn()
    };
    const mockToastController: Partial<ToastController> = {};
    const mockLocalCourseService: Partial<LocalCourseService> = {};
    const mockSbProgressLoader: Partial<SbProgressLoader> = {};

    beforeAll(() => {
        coursesPage = new CoursesPage(
            mockEventBusService as EventsBusService,
            mockPageService as PageAssembleService,
            mockPreferences as SharedPreferences,
            mockCourseService as CourseService,
            mockContentService as ContentService,
            mockFrameworkService as FrameWorkService,
            mockFormAndFrameworkUtilService as FormAndFrameworkUtilService,
            mockAppVersion as AppVersion,
            mockNgZone as NgZone,
            mockQrScanner as SunbirdQRScanner,
            mockPopCtrl as PopoverController,
            mockEvents as Events,
            mockAppGlobalService as AppGlobalService,
            mockCourseUtilService as CourseUtilService,
            mockCommonUtilService as CommonUtilService,
            mockTelemetryGeneratorService as TelemetryGeneratorService,
            mockNetwork as Network,
            mockRouter as Router,
            mockToastController as ToastController,
            mockHeaderService as AppHeaderService,
            mockLocalCourseService as LocalCourseService,
            mockSbProgressLoader as SbProgressLoader
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of coursePage', () => {
        expect(coursesPage).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should return enrolledCourse data and course tab data by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = {isOnBoardingCardCompleted: true, contentId: 'do_123'};
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const course: Course[] = [{
                identifier: 'do_0123'
            }];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(course));
            mockCommonUtilService.getContentImg = jest.fn();
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
                expect(mockAppGlobalService.setEnrolledCourseList).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({returnFreshCourses: false, userId: undefined});
                done();
            }, 0);
        });

        it('should not return enrolledCourse data if data is available by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = {isOnBoardingCardCompleted: true, contentId: 'do_123'};
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockCourseService.getEnrolledCourses = jest.fn(() => of(undefined));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({returnFreshCourses: false, userId: undefined});
                done();
            }, 0);
        });

        it('should return enrolledCourse data if enrolledCourses length is zero by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = {isOnBoardingCardCompleted: true, contentId: 'do_123'};
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            const course: Course[] = [];
            mockCourseService.getEnrolledCourses = jest.fn(() => of(course));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({returnFreshCourses: false, userId: undefined});
                done();
            }, 0);
        });

        it('should return error enrolledCourse data by invoked ngOnIt', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'getCourseTabData').mockReturnValue();
            const param = {isOnBoardingCardCompleted: true, contentId: 'do_123'};
            mockEvents.subscribe = jest.fn((_, fn) => fn(param));
            mockAppGlobalService.setEnrolledCourseList = jest.fn();
            const course: Course[] = [{
                identifier: 'do_0123'
            }];
            mockCourseService.getEnrolledCourses = jest.fn(() => throwError(course));
            // act
            coursesPage.ngOnInit();
            // assert
            setTimeout(() => {
                expect(coursesPage.getCourseTabData).toHaveBeenCalled();
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({returnFreshCourses: false, userId: undefined});
                done();
            }, 0);
        });
    });

    it('should generate telemetry and navigate to search page', (done) => {
        // arrange
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        mockFormAndFrameworkUtilService.getSupportedContentFilterConfig = jest.fn(() => Promise.resolve(['sample1', 'sample2']));
        mockRouter.navigate = jest.fn();
        // act
        coursesPage.search();
        // assert
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
            InteractSubtype.SEARCH_BUTTON_CLICKED,
            Environment.HOME,
            PageId.COURSES);
        setTimeout(() => {
            expect(mockFormAndFrameworkUtilService.getSupportedContentFilterConfig).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalled();
            done();
        }, 0);
    });


    describe('handleHeaderEvents', () => {
        it('should trigger search() if event name receives search', (done) => {
            // arrange
            jest.spyOn(coursesPage, 'search').mockImplementation();
            // act
            coursesPage.handleHeaderEvents({name: 'search'});
            // assert
            setTimeout(() => {
                expect(coursesPage.search).toHaveBeenCalled();
                done();
            }, 0);
        });
        it('should trigger showFilter() if event name receives search', () => {
            // arrange
            jest.spyOn(coursesPage, 'showFilter').mockImplementation();
            // act
            coursesPage.handleHeaderEvents({name: 'filter'});
            // assert
            expect(coursesPage.showFilter).toHaveBeenCalled();
        });

        it('should trigger redirectToActivedownloads() if event name receives search', (done) => {
            // arrange
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.handleHeaderEvents({name: 'download'});
            // assert
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.ACTIVE_DOWNLOADS_CLICKED,
                Environment.HOME,
                PageId.COURSES
            );
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });
    });


    it('should handle header service by invoked ionViewWillEnter', () => {
        // arrange
        coursesPage.refresher = {
            disabled: true
        } as any;
        mockEvents.subscribe = jest.fn((_, fn) => fn());
        mockHeaderService.showHeaderWithHomeButton = jest.fn();
        const data = jest.fn((fn => fn()));
        mockHeaderService.headerEventEmitted$ = {
            subscribe: data
        } as any;
        jest.spyOn(coursesPage, 'handleHeaderEvents').mockReturnValue();
        // act
        coursesPage.ionViewWillEnter();
        // assert
        expect(mockEvents.subscribe).toHaveBeenCalled();
        expect(mockHeaderService.showHeaderWithHomeButton).toHaveBeenCalled();
        expect(data).toHaveBeenCalled();
    });

    describe('ionViewDidEnter', () => {
        it('should start qrScanner if pageId is course', () => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = {pageName: 'courses'};
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockQrScanner.startScanner = jest.fn(() => Promise.resolve('start'));
            mockSbProgressLoader.hide = jest.fn();
            // act
            coursesPage.ionViewDidEnter();
            // assert
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalledWith(PageId.COURSES, isOnboardingComplete);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockQrScanner.startScanner).toHaveBeenCalledWith(PageId.COURSES, false);
            expect(mockSbProgressLoader.hide).toHaveBeenCalled();
        });

        it('should not start qrScanner if pageId is not course', () => {
            // arrange
            const isOnboardingComplete = coursesPage.isOnBoardingCardCompleted = true;
            const data = {pageName: 'library'};
            mockAppGlobalService.generateConfigInteractEvent = jest.fn();
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockSbProgressLoader.hide = jest.fn();
            // act
            coursesPage.ionViewDidEnter();
            // assert
            expect(mockAppGlobalService.generateConfigInteractEvent).toHaveBeenCalledWith(PageId.COURSES, isOnboardingComplete);
            expect(mockEvents.subscribe).toHaveBeenCalled();
            expect(mockSbProgressLoader.hide).toHaveBeenCalled();
        });
    });

    describe('ionViewWillLeave', () => {
        it('should unsubscribe eventservice and headerObservable by invoked ionViewWillLeave', () => {
            // arrange
            coursesPage.refresher = {disabled: true};
            coursesPage.headerObservable = true;
            coursesPage.headerObservable = {
                unsubscribe: jest.fn(() => true)
            };
            mockEvents.unsubscribe = jest.fn((_) => true);
            mockNgZone.run = jest.fn((fn) => fn());
            // act
            coursesPage.ionViewWillLeave();
            // assert
            expect(coursesPage.headerObservable).toBeTruthy();
            expect(coursesPage.headerObservable.unsubscribe).toHaveBeenCalled();
            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
            expect(mockNgZone.run).toHaveBeenCalled();
        });

        it('should not unsubscribe eventservice and headerObservable for else part', () => {
            // arrange
            coursesPage.headerObservable = false;
            mockEvents.unsubscribe = jest.fn((_) => true);
            mockNgZone.run = jest.fn((fn) => fn('data'));
            // act
            coursesPage.ionViewWillLeave();
            // assert
            expect(coursesPage.headerObservable).toBeFalsy();
            expect(mockEvents.unsubscribe).toHaveBeenCalledWith('update_header');
            expect(mockNgZone.run).toHaveBeenCalled();
        });
    });

    it('should generate network type and generate telemetry', () => {
        // arrange
        mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
        const values = new Map();
        values['network-type'] = mockNetwork.type = '4g';
        // act
        coursesPage.generateNetworkType();
        // assert
        expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalledWith(values, PageId.LIBRARY);
    });

    describe('getPopularAndLatestCourses', () => {
        it('should return pageAssemble data when PageAssembleCriteria is undefined', (done) => {
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = '';
            mockPageService.getPageAssemble = jest.fn(() => throwError('NOT_FOUND'));
            coursesPage.selectedLanguage = 'en';
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(false);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should return pageAssemble data when PageAssembleCriteria is not undefined', (done) => {
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = {board: 'cbsc', medium: 'english'};
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{
                    display: '{"name": {"en": "example"}}',
                    contents: [{identifier: 'sample_id'}]
                }]
            }));
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            coursesPage.selectedLanguage = 'en';
            const values = new Map();
            values['pageSectionCount'] = 1;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            mockCommonUtilService.getContentImg = jest.fn();
            // mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            // act
            coursesPage.getPopularAndLatestCourses(false);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.getContentImg).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: ['cbsc', 'assam'],
                medium: ['english', 'hindi'],
                grade: ['class 1', 'class 2'],
                subject: ['math', 'phy']
            };
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = {board: 'cbsc', medium: 'english'};
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{
                    display: '{"name": {"en": "example"}}',
                    contents: [{identifier: 'sample_id'}]
                }]
            }));
            coursesPage.selectedLanguage = 'hindi';
            const values = new Map();
            values['pageSectionCount'] = 1;
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockTelemetryGeneratorService.generateExtraInfoTelemetry = jest.fn();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockAppGlobalService.getNameForCodeInFramework = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateExtraInfoTelemetry).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data if board medium and grade are undefined', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => of({
                sections: [{display: '{}'}]
            }));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockAppGlobalService.getNameForCodeInFramework = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should applied filter for latest course data for pageService error part of connection-error', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => throwError('CONNECTION_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_NO_INTERNET_MESSAGE');
                done();
            }, 0);
        });

        it('should applied filter for latest course data for pageService error part of SERVER_ERROR', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = undefined;
            mockPageService.getPageAssemble = jest.fn(() => throwError('SERVER_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                done();
            }, 0);
        });


        it('should applied filter for latest course data for pageService error part of SERVER_AUTH_ERROR', (done) => {
            const requestPageFilter: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                filters: {
                    board: ['cbsc', 'assam'],
                    medium: ['english', 'hindi'],
                    grade: ['class 1', 'class 2'],
                    subject: ['math', 'phy']
                },
                mode: 'soft'
            };
            coursesPage.profile = {
                board: [],
                medium: [],
                grade: [],
                subject: []
            };
            const rqst = {filters: {}, mode: 'soft', name: 'Course', source: 'app'};
            coursesPage.appliedFilter = '';
            mockPageService.getPageAssemble = jest.fn(() => throwError('SERVER_AUTH_ERROR'));
            coursesPage.selectedLanguage = 'hindi';
            jest.spyOn(coursesPage, 'generateExtraInfoTelemetry').mockReturnValue();
            jest.spyOn(coursesPage, 'checkEmptySearchResult').mockReturnValue();
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getPopularAndLatestCourses(true, requestPageFilter);
            // assert
            setTimeout(() => {
                expect(mockPageService.getPageAssemble).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_FETCHING_DATA');
                done();
            }, 0);
        });
    });

    describe('getContentDetails', () => {
        it('should call contentService getContentDetails check if available locally or not', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockEventBusService.events = jest.fn(() => of({
                type: 'PROGRESS',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            mockNgZone.run = jest.fn((fn) => fn());
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{id: 'do123', type: 'resource'}],
                rollup: {l1: 'do123'}
            }]);
            mockContentService.importContent = jest.fn(() => of([
                {identifier: 'do123', status: 1}, {identifier: 'do1234', status: 0}
            ]));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = {style: {display: 'flex'}};
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should check payload if import completed and download percentage is 100', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            coursesPage.resumeContentData = mockCourse;
            coursesPage.downloadPercentage = 100;
            mockRouter.navigate = jest.fn();
            mockNgZone.run = jest.fn((fn) => fn());
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{id: 'do123', type: 'resource'}],
                rollup: {l1: 'do123'}
            }]);
            mockContentService.importContent = jest.fn(() => throwError('error'));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = {style: {display: 'flex'}};
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('navigate to details if data is available locally but pkgVersion is different', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 1
                }
            };
            const mockContent: Content = {
                isAvailableLocally: true,
                contentData: {
                    pkgVersion: 2
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockContentService.getContentDetails).toHaveBeenCalled();
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should go to else part and call contentDetailsImportCall', (done) => {
            // arrange
            const mockCourse: Course = {
                identifier: 'do123',
                content: {
                    pkgVersion: 2
                }
            };
            const mockContent: Content = {
                isAvailableLocally: false,
                contentData: {
                    pkgVersion: 1
                },

            };
            mockContentService.getContentDetails = jest.fn(() => of(mockContent));
            mockEventBusService.events = jest.fn(() => of({
                type: 'IMPORT_COMPLETED',
                payload: {
                    identifier: 'do123',
                    progress: 100
                }
            }));
            coursesPage.resumeContentData = mockCourse;
            coursesPage.downloadPercentage = 100;
            mockRouter.navigate = jest.fn();
            mockCourseUtilService.getImportContentRequestBody = jest.fn(() => [{
                isChildContent: true,
                destinationFolder: './///',
                contentId: 'do123',
                correlationData: [{id: 'do123', type: 'resource'}],
                rollup: {l1: 'do123'}
            }]);
            mockContentService.importContent = jest.fn(() => of([
                {identifier: 'do123', status: 1}, {identifier: 'do1234', status: 0}
            ]));
            mockCommonUtilService.showToast = jest.fn();
            coursesPage.tabBarElement = {style: {display: 'flex'}};

            coursesPage.getContentDetails(mockCourse);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('COURSE_NOT_AVAILABLE');
                done();
            }, 0);
        });

        it('should go catch part if getContentDetails throw network error', (done) => {
            // arrange
            const mockCourse: Course = {
                identifier: 'do123',
                content: {
                    pkgVersion: 2
                }
            };
            const error = new CsNetworkError('no internet');
            mockContentService.getContentDetails = jest.fn(() => throwError(error));
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('NO_INTERNET');
                done();
            }, 0);
        });

        it('should go to catch part and call showToast if throw other error', (done) => {
            // arrange
            const mockCourse: Course = {
                contentId: 'do123',
                batchId: '0987655',
                content: {
                    pkgVersion: 2
                }
            };
            mockContentService.getContentDetails = jest.fn(() => throwError('error'));
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.getContentDetails(mockCourse);
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalledWith('ERROR_CONTENT_NOT_AVAILABLE');
                done();
            }, 0);
        });
    });

    describe('subscribeUtilityEvents', () => {
        it('should applied filter for tab change and data trim as course', (done) => {
            // arrange
            const data = {trim: jest.fn(() => 'courses'), update: true, batchId: 'd0_0123', selectedLanguage: 'en'};
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getEnrolledCourses').mockReturnValue();
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            coursesPage.appliedFilter = true;
            jest.spyOn(coursesPage, 'getPopularAndLatestCourses').mockImplementation(() => {
            });
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                done();
            }, 0);
        });

        it('should not applied filter for tab change and data trim as course', (done) => {
            // arrange
            const data = {trim: jest.fn(() => 'courses')};
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            coursesPage.appliedFilter = false;
            jest.spyOn(coursesPage, 'getPopularAndLatestCourses').mockReturnValue();
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                expect(coursesPage.appliedFilter).toBeFalsy();
                done();
            }, 0);
        });

        it('should not apply filter for tab change and data trim is not course', (done) => {
            // arrange
            const data = {trim: jest.fn(() => 'library')};
            coursesPage.isUpgradePopoverShown = false;
            mockEvents.subscribe = jest.fn((_, fn) => fn(data));
            mockAppGlobalService.openPopover = jest.fn(() => Promise.resolve());
            jest.spyOn(coursesPage, 'getContentDetails').mockReturnValue();
            // act
            coursesPage.subscribeUtilityEvents();
            // assert
            setTimeout(() => {
                expect(mockEvents.subscribe).toHaveBeenCalled();
                expect(mockAppGlobalService.openPopover).toHaveBeenCalled();
                expect(coursesPage.isUpgradePopoverShown).toBeTruthy();
                done();
            }, 0);
        });
    });

    describe('navigateToDetails()', () => {

        it('should generate telemetry object, check for layout name and filter applied and navigate to details page', (done) => {
            // arrange
            const mockContent = {
                contentId: 'do123',
                contentType: 'Course'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'InProgress',
                isFilterApplied: true, env: 'home', pageName: 'Course', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'Course', {id: 'do123', type: 'Course', version: undefined},
                    values, {l1: 'do123'}, undefined
                );
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });

        it('should generate telemetry object,for collection and navigate to details page', (done) => {
            // arrange
            const mockContent = {
                identifier: 'do123',
                contentType: 'collection',
                mimeType: 'application/vnd.ekstep.content-collection'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'sampleLayout',
                isFilterApplied: true, env: 'home', pageName: 'Collection', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            mockTelemetryGeneratorService.isCollection = jest.fn();

            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'Collection', {id: 'do123', type: 'Resource', version: undefined},
                    values, {l1: 'do123'}, undefined
                );
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });

        it('should generate telemetry object, check for contentType resource and goto content-details page', (done) => {
            // arrange
            const mockContent = {
                contentId: 'do123',
                contentType: 'Resource',
                mimeType: 'resource'
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockCommonUtilService.deDupe = jest.fn();
            const mockCourseDetails = {
                layoutName: 'completed',
                isFilterApplied: true, env: 'home', pageName: 'library', sectionName: 'sampleSection', index: 2
            };
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['sectionName'] = mockCourseDetails.sectionName;
            values['positionClicked'] = mockCourseDetails.index;
            // act
            coursesPage.navigateToDetailPage(mockContent, mockCourseDetails);
            setTimeout(() => {
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                    InteractType.TOUCH,
                    InteractSubtype.CONTENT_CLICKED,
                    'home', 'library', {id: 'do123', type: 'Resource', version: undefined},
                    values, {l1: 'do123'}, undefined
                );
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            });
        });

    });


    describe('navigateToBatchListPopup', () => {
        it('should show a message saying, the user is offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            const content = {
                identifier: 'sample_id'
            };
            const courseDetails = {
                guestUser: true
            };
            mockCommonUtilService.showToast = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.showToast).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is not logged in', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const content = {
                identifier: 'sample_id'
            };
            const courseDetails = {
                guestUser: true
            };
            mockRouter.navigate = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockRouter.navigate).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is logged in and batchlist is not empty', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const content = {
                identifier: 'sample_id',
                contentId: 'sample_id'
            };
            const courseDetails = {
                guestUser: false,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            mockRouter.navigate = jest.fn();
            const courseBatchesRequest = {
                filters: {
                    courseId: courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
                    enrollmentType: CourseEnrollmentType.OPEN,
                    status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS]
                },
                sort_by: {
                    createdDate: 'desc',
                },
                fields: BatchConstants.REQUIRED_FIELDS
            };
            const data = [{
                status: 1
            }, {
                status: 2
            }
            ];
            mockPopCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: true}}))
            } as any)));
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            coursesPage.loader = {
                dismiss: jest.fn()
            };
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalledWith(courseBatchesRequest);
                expect(mockPopCtrl.create).toHaveBeenCalled();
                expect(mockNgZone.run).toHaveBeenCalled();
                expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should navigate tocourse batchs page if user is logged in and batchlist is empty', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            const content = {
                identifier: 'sample_id',
                contentId: 'sample_id'
            };
            const courseDetails = {
                guestUser: false,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            mockRouter.navigate = jest.fn();
            const courseBatchesRequest = {
                filters: {
                    courseId: courseDetails.layoutName === ContentCard.LAYOUT_INPROGRESS ? content.contentId : content.identifier,
                    enrollmentType: CourseEnrollmentType.OPEN,
                    status: [CourseBatchStatus.NOT_STARTED, CourseBatchStatus.IN_PROGRESS]
                },
                sort_by: {
                    createdDate: 'desc',
                },
                fields: BatchConstants.REQUIRED_FIELDS
            };
            const data = [];
            mockPopCtrl.create = jest.fn(() => (Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({data: {canDelete: true}}))
            } as any)));
            mockCourseService.getCourseBatches = jest.fn(() => of(data));
            coursesPage.loader = {
                dismiss: jest.fn()
            };
            coursesPage.navigateToDetailPage = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            coursesPage.navigateToBatchListPopup(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(mockCourseService.getCourseBatches).toHaveBeenCalledWith(courseBatchesRequest);
                expect(coursesPage.navigateToDetailPage).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    describe('checkRetiredOpenBatch', () => {
        it('should skip the execution, if course already in progress', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            coursesPage.loader = mockCommonUtilService.getLoader;
            const enrolledCourses = [{
                batch: {status: 1},
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: ContentCard.LAYOUT_INPROGRESS
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToDetailPage = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                done();
            }, 0);
        });

        it('should check the course status equal to 1, which is a non retired course', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            const enrolledCourses = [{
                batch: {status: 1},
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: 'sample_name'
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToDetailPage = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(coursesPage.navigateToDetailPage).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should check the course status equal to 2, which is a retired course', (done) => {
            // arrange
            const dismissFn = jest.fn(() => Promise.resolve());
            const presentFn = jest.fn(() => Promise.resolve());
            mockCommonUtilService.getLoader = jest.fn(() => ({
                present: presentFn,
                dismiss: dismissFn,
            })) as any;
            coursesPage.loader = mockCommonUtilService.getLoader;
            const enrolledCourses = [{
                batch: {status: 2},
                cProgress: 80,
                contentId: 'sample_id1'
            }];
            const courseDetails = {
                enrolledCourses,
                layoutName: 'sample_name'
            };
            const content = {
                identifier: 'sample_id1',
                batch: {}
            };
            coursesPage.navigateToBatchListPopup = jest.fn();
            // act
            coursesPage.checkRetiredOpenBatch(content, courseDetails);
            // assert
            setTimeout(() => {
                expect(coursesPage.navigateToBatchListPopup).toHaveBeenCalled();
                done();
            }, 0);
        });

    });

    describe('openEnrolledCourseDetails', () => {
        it('should prepare the request parameters to open the enrolled training', () => {
            // arrange
            const contentData = {
                data: {name: 'sample_name'}
            };
            coursesPage.checkRetiredOpenBatch = jest.fn();
            // act
            coursesPage.openEnrolledCourseDetails(contentData);
            // assert
            expect(coursesPage.checkRetiredOpenBatch).toHaveBeenCalled();
        });
    });

    describe('openCourseDetails', () => {
        it('should prepare the request parameters to open the un-enrolled training', () => {
            // arrange
            const contentData = {
                data: {
                    name: 'sample_name',
                    identifier: 'sample_id2'
                }
            };
            const index = 0;
            const sectionData = {
                name: 'sectionName'
            };
            coursesPage.popularAndLatestCourses = [{
                contents: [{
                    identifier: 'sample_id1'
                }, {
                    identifier: 'sample_id2'
                }, {
                    identifier: 'sample_id3'
                }]
            }];
            coursesPage.checkRetiredOpenBatch = jest.fn();
            // act
            coursesPage.openCourseDetails(contentData, sectionData, index);
            // assert
            expect(coursesPage.checkRetiredOpenBatch).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy()', () => {
        it('destroy should unsubscribe 12 events', () => {
            jest.spyOn(coursesPage, 'unsubscribeUtilityEvents');
            // act
            coursesPage.ngOnDestroy();
            // assert
            expect(coursesPage.unsubscribeUtilityEvents).toBeCalled();
            expect(mockEvents.unsubscribe).toBeCalledWith('update_header');
        });
    });

    describe('getUserId', () => {
        it('should check if user is guest', (done) => {
            // arrange
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => false);
            mockAppGlobalService.setEnrolledCourseList = jest.fn(() => []);
            mockAppGlobalService.getGuestUserType = jest.fn(() => ProfileType.TEACHER);
            mockCommonUtilService.isAccessibleForNonStudentRole = jest.fn(() => true);
            mockAppGlobalService.DISPLAY_SIGNIN_FOOTER_CARD_IN_COURSE_TAB_FOR_TEACHER = true;
            // act
            coursesPage.getUserId().catch(() => {
                expect(coursesPage.guestUser).toBeTruthy();
                done();
            });
        });

        it('should check if user is loggedIn user', (done) => {
            // arrange
            const sessionObj = {
                userToken: 'sample_token'
            };
            mockAppGlobalService.isUserLoggedIn = jest.fn(() => true);
            mockAppGlobalService.getSessionData = jest.fn(() => sessionObj);
            jest.spyOn(coursesPage, 'getEnrolledCourses').mockImplementation();
            // act
            setTimeout(() => {
                coursesPage.getUserId();
                expect(coursesPage.userId).toBe('sample_token');
                expect(coursesPage.getEnrolledCourses).toHaveBeenCalledWith(false, true);
                done();
            }, 0);
        });
    });

    describe('navigateToViewMoreContents page', () => {
        it('should present toast for offline', (done) => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            mockToastController.create = jest.fn(() => {
                return Promise.resolve({
                    present: jest.fn(() => Promise.resolve({})),
                    onDidDismiss: jest.fn(() => Promise.resolve({}))
                });
            }) as any;
            mockCommonUtilService.translateMessage = jest.fn();
            // act
            coursesPage.navigateToViewMoreContentsPage(false);
            // assert
            setTimeout(() => {
                expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('NO_INTERNET_TITLE');
                done();

            }, 0);
        });

        it('should translate message for courses in progress and generate telemetry and navigate to viewmore activity', () => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            mockCommonUtilService.translateMessage = jest.fn();
            mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockRouter.navigate = jest.fn();
            const values = new Map();
            values['SectionName'] = 'My courses';
            // act
            coursesPage.navigateToViewMoreContentsPage(true);
            // assert
            expect(mockCommonUtilService.translateMessage).toHaveBeenCalledWith('COURSES_IN_PROGRESS');
            expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
                InteractType.TOUCH,
                InteractSubtype.VIEWALL_CLICKED,
                Environment.HOME,
                PageId.COURSES, undefined, values
            );
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('cancel download', () => {

        it('should call contentService cancelDownload', (done) => {
            // arrange
            coursesPage.resumeContentData = {
                contentId: 'do123'
            };
            mockNgZone.run = jest.fn((fn) => fn());
            coursesPage.tabBarElement = {style: {display: 'flex'}};
            mockContentService.cancelDownload = jest.fn(() => of(undefined));
            // act
            coursesPage.cancelDownload();
            setTimeout(() => {
                expect(coursesPage.showOverlay).toBeFalsy();
                done();
            }, 0);
        });

        it('show go to catch part if cancel throw error', (done) => {
            // arrange
            coursesPage.resumeContentData = {
                identifier: 'do123'
            };
            mockNgZone.run = jest.fn((fn) => fn());
            coursesPage.tabBarElement = {style: {display: 'flex'}};
            mockContentService.cancelDownload = jest.fn(() => throwError('error'));
            // act
            coursesPage.cancelDownload();
            setTimeout(() => {
                expect(coursesPage.showOverlay).toBeFalsy();
                done();
            }, 0);
        });
    });

    describe('retryShowingPopularCourses test cases', () => {
        it('should check for isNetworkAvailable and showRefresh', () => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: true};
            jest.spyOn(coursesPage, 'getCourseTabData').mockImplementation();
            // act
            coursesPage.retryShowingPopularCourses(true);
            // assert
            expect(coursesPage.getCourseTabData).toHaveBeenCalled();
        });

        it('should check for isNetworkAvailable returns false and showRefresh also false', () => {
            // arrange
            mockCommonUtilService.networkInfo = {isNetworkAvailable: false};
            jest.spyOn(coursesPage, 'getCourseTabData').mockImplementation();
            // act
            coursesPage.retryShowingPopularCourses(false);
            // assert
            expect(coursesPage.getCourseTabData).not.toHaveBeenCalled();
        });
    });

    it('should call presentOffline toast message when showOfflineWarning called upon', (done) => {
        // arrange
        mockToastController.create = jest.fn(() => {
            return Promise.resolve({
                present: jest.fn(() => Promise.resolve({})),
                onDidDismiss: jest.fn(() => Promise.resolve({}))
            });
        }) as any;
        // act
        coursesPage.showOfflineWarning();
        setTimeout(() => {
            expect(mockToastController.create).toHaveBeenCalled();
            done();
        }, 0);
    });
});

