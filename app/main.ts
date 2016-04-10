/**
 * @license MIT
 * @author 0@39.yt (Yurij Mikhalevich)
 * @module main
 */
import {bootstrap} from 'angular2/platform/browser';

import {Graph, GraphDataStorage} from './graph.component';
import {Calculator} from './calculator';
import {Impulse} from './impulse.component';
import {Details} from './details.component';
import {ActionsPanel} from './actions-panel';

import {Type} from 'angular2/src/facade/lang';
import {Component, ElementRef, ViewChild, provide} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteDefinition} from 'angular2/router';
import {HTTP_PROVIDERS, Http} from 'angular2/http';

import {TranslateService, TranslatePipe, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';

const ElectronSettings = require('electron-settings');

const settings = new ElectronSettings();

declare const componentHandler: any;

const routes = [
  {path: '/', name: 'Graph', component: Graph, title: 'PAGE.GRAPH'},
  {path: '/process/', name: 'Process', component: Impulse, title: 'PAGE.IMPULSE'},
  {path: '/details/', name: 'Details', component: Details, title: 'PAGE.DETAILS'},
];

@Component({
  selector: 'app',
  templateUrl: '/app/app.html',
  directives: [ROUTER_DIRECTIVES],
  pipes: [TranslatePipe]
})
@RouteConfig(<RouteDefinition[]> routes)
class AppComponent {
  private title: string = 'Cognitive Modeling';
  private routes: any[] = routes;
  @ViewChild('tab') private firstTab: ElementRef;
  private activeTab: Element;
  private currentLanguage: string = 'en';

  constructor(
    private element: ElementRef,
    private panel: ActionsPanel,
    private translate: TranslateService)
  {
    let language = settings.get('language');
    if (!language) {
      // use navigator lang if available
      language = navigator.language.split('-')[0];
      language = /(ru|en)/gi.test(language) ? language : 'en';
      settings.set('language', language);
    }

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    this.translate.onLangChange.subscribe((lang: {lang: string}) => {
      settings.set('language', lang.lang);
      this.currentLanguage = lang.lang;
    });

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use(language);
  }

  tabSwitched(event: Event) {
    event.preventDefault();
    if (this.activeTab === event.target) return;
    this.activeTab.classList.remove('is-active');
    this.activeTab = <Element> event.target;
    this.activeTab.classList.add('is-active');
  }

  ngAfterViewInit() {
    componentHandler.upgradeElements(this.element.nativeElement);
    this.activeTab = this.firstTab.nativeElement;
  }

  switchLanguage(event: Event) {
    const select: HTMLSelectElement = <HTMLSelectElement> event.target;
    this.translate.use(select.value);
  }
}

bootstrap(<Type> AppComponent, [
  GraphDataStorage,
  Calculator,
  ActionsPanel,
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  provide(TranslateLoader, {
    useFactory: (http: Http) => new TranslateStaticLoader(http, 'i18n', '.json'),
    deps: [Http]
  }),
  TranslateService
]);
