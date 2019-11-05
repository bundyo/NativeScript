import { View, PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty } from "./page-common";
import { ActionBar } from "../action-bar";
import {FlexLayout, QGridLayout, QWidget} from "@nodegui/nodegui";
import { device } from "../../platform";
import { profile } from "../../profiling";
import { ViewBase } from "./page-common";

export * from "./page-common";

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

export class Page extends PageBase {
    public nativeViewProtected: QWidget;
    private _layout: QGridLayout;

    public createNativeView() {
        const view = new QWidget();
        view.setObjectName("root");
        this._layout = new QGridLayout();
        view.setLayout(this._layout);

        return view;
    }

    public initNativeView(): void {
        super.initNativeView();
        //this.nativeViewProtected.setBackgroundColor(-1); // White color.
    }

    public _addViewToNativeVisualTree(view: View, atIndex?: number): boolean {
        if (this.nativeViewProtected && view.nativeViewProtected) {
            if (view instanceof ActionBar) {
                this._layout.addWidgetAt(view.nativeViewProtected, 0, 0);
                view.nativeViewProtected.setInlineStyle("height: 50;");
            } else {
                this._layout.addWidgetAt(view.nativeViewProtected, 1, 0);
                view.nativeViewProtected.setInlineStyle("flex: 1;");
            }
        }

        return super._addViewToNativeVisualTree(view, atIndex);
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        if (this.actionBarHidden !== undefined) {
            this.updateActionBar();
        }
    }

    private updateActionBar() {
        this.actionBar.update();
    }

    [actionBarHiddenProperty.setNative](value: boolean) {
        this.updateActionBar();
    }

    [statusBarStyleProperty.getDefault](): { color: number, systemUiVisibility: number } {
        // if (device.sdkVersion >= "21") {
        //     const window = (<androidx.appcompat.app.AppCompatActivity>this._context).getWindow();
        //     const decorView = window.getDecorView();
        //
        //     return {
        //         color: (<any>window).getStatusBarColor(),
        //         systemUiVisibility: decorView.getSystemUiVisibility()
        //     };
        // }

        return null;
    }
    [statusBarStyleProperty.setNative](value: "dark" | "light" | { color: number, systemUiVisibility: number }) {
        if (device.sdkVersion >= "21") {
            //const window = (<androidx.appcompat.app.AppCompatActivity>this._context).getWindow();
            //const decorView = window.getDecorView();

            // if (value === "light") {
            //     (<any>window).setStatusBarColor(STATUS_BAR_LIGHT_BCKG);
            //     decorView.setSystemUiVisibility(SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            //
            // } else if (value === "dark") {
            //     (<any>window).setStatusBarColor(STATUS_BAR_DARK_BCKG);
            //     decorView.setSystemUiVisibility(0);
            // } else {
            //     (<any>window).setStatusBarColor(value.color);
            //     decorView.setSystemUiVisibility(value.systemUiVisibility);
            // }
        }
    }
}
