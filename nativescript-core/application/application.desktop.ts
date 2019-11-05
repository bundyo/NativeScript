// Definitions.
import {
    DesktopApplication as DesktopApplicationDefinition,
    ApplicationEventData,
    CssChangedEventData,
    OrientationChangedEventData
} from ".";

import {
    displayedEvent,
    getCssFileName,
    hasLaunched,
    hasListeners,
    launchEvent,
    livesync,
    lowMemoryEvent,
    notify,
    Observable,
    on,
    orientationChanged,
    orientationChangedEvent,
    setApplication,
    suspendEvent
} from "./application-common";

import * as appCommon from "./application-common";

import {
    QApplication
} from "@nodegui/nodegui";

import {
    CSSSource, loadAppCSS
} from "../ui/styling/style-scope";

import { profile } from "../profiling";

// First reexport so that app module is initialized.
export * from "./application-common";

// Types.
import { Frame, NavigationEntry, View } from "../ui/frame";
import { Builder } from "../ui/builder";
import {sanitizeModuleName} from "../ui/builder/module-name-sanitizer";
import {resolveModuleName} from "../module-name-resolver";

export class DesktopApplication extends Observable implements DesktopApplicationDefinition {
    private _orientation: "portrait" | "landscape" | "unknown";
    private _rootView: View = null;
    public systemAppearance: "dark" | "light" | null;
    public paused: boolean;
    public nativeApp: QApplication = null;
    public packageName: string;

    public init(nativeApp: any) {
        if (this.nativeApp === nativeApp) {
            return;
        }

        if (this.nativeApp) {
            throw new Error("application.android already initialized.");
        }

        notify({
            eventName: launchEvent,
            object: this,
            web: null
        });

        if (!this._rootView) {
            // try to navigate to the mainEntry (if specified)
            if (mainEntry) {
                if (createRootFrame.value) {
                    const frame = this._rootView = new Frame();
                    frame.navigate(mainEntry);
                } else {
                    this._rootView = Builder.createViewFromEntry(mainEntry);
                }
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        }

        this.nativeApp = nativeApp;

        if (!this._rootView.isLoaded) {
            this._rootView.callLoaded();
        }

        return this._rootView;
    }

    get rootView(): View {
        return this._rootView;
    }

    get orientation(): "portrait" | "landscape" | "unknown" {
        if (!this._orientation) {
            // const resources = this.context.getResources();
            // const configuration = resources.getConfiguration();
            // const orientation = configuration.orientation;

            // this._orientation = getOrientationValue(orientation);
        }

        return this._orientation;
    }

    set orientation(value: "portrait" | "landscape" | "unknown") {
        this._orientation = value;
    }
}

const desktopApp = new DesktopApplication();
export { desktopApp as desktop };

setApplication(desktopApp);

let mainEntry: NavigationEntry;
let started = false;
const createRootFrame = { value: true };
let css;

export function _start(entry?: NavigationEntry | string) {
    if (started) {
        throw new Error("Application is already started.");
    }

    started = true;
    mainEntry = typeof entry === "string" ? { moduleName: entry } : entry;
    if (!desktopApp.nativeApp) {
        const nativeApp = getNativeApplication();
        desktopApp.init(nativeApp);
    }
}

export function _shouldCreateRootFrame(): boolean {
    return createRootFrame.value;
}

export function run(entry?: NavigationEntry | string) {
    createRootFrame.value = false;
    _start(entry);
}

export function addCss(cssText: string): void {
    notify(<CssChangedEventData>{ eventName: "cssChanged", object: desktopApp, cssText: cssText });
    const rootView = getRootView();
    if (rootView) {
        rootView._onCssStateChange();
    }
}

const CALLBACKS = "_callbacks";

export function _resetRootView(entry?: NavigationEntry | string) {
    // const activity = desktopApp.foregroundActivity;
    // if (!activity) {
    //     throw new Error("Cannot find android activity.");
    // }

    createRootFrame.value = false;
    mainEntry = typeof entry === "string" ? { moduleName: entry } : entry;
    // const callbacks: AndroidActivityCallbacks = activity[CALLBACKS];
    // if (!callbacks) {
    //     throw new Error("Cannot find android activity callbacks.");
    // }
    // callbacks.resetActivityContent(activity);
}

export function getMainEntry() {
    return mainEntry;
}

export function getRootView(): View {
    // // Use start activity as a backup when foregroundActivity is still not set
    // // in cases when we are getting the root view before activity.onResumed event is fired
    // const activity = desktopApp.foregroundActivity || desktopApp.startActivity;
    // if (!activity) {
    //     return undefined;
    // }
    // const callbacks: AndroidActivityCallbacks = activity[CALLBACKS];
    //
    if (desktopApp.rootView) {
        return desktopApp.rootView;
    }
}

export function getNativeApplication(): QApplication {
    // Try getting it from module - check whether application.android.init has been explicitly called
    let nativeApp = desktopApp.nativeApp;
    if (!nativeApp) {
        nativeApp = QApplication.instance();

        // we cannot work without having the app instance
        if (!nativeApp) {
            throw new Error("Failed to retrieve native QMainWindow object.");
        }
    }

    return nativeApp;
}

export function orientation(): "portrait" | "landscape" | "unknown" {
    return desktopApp.orientation;
}

on(orientationChangedEvent, (args: OrientationChangedEventData) => {
    const rootView = getRootView();
    if (rootView) {
        orientationChanged(rootView, args.newValue);
    }
});

global.__onLiveSync = function __onLiveSync(context?: ModuleContext) {
    if (desktopApp && desktopApp.paused) {
        return;
    }

    const rootView = getRootView();
    livesync(rootView, context);
};

function getOrientationValue(orientation: number): "portrait" | "landscape" | "unknown" {
    switch (orientation) {
        case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
            return "landscape";
        case android.content.res.Configuration.ORIENTATION_PORTRAIT:
            return "portrait";
        default:
            return "unknown";
    }
}
