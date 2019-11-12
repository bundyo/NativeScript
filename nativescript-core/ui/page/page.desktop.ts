import { PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty } from "./page-common";
import { ActionBar } from "../action-bar";
import { View } from "../core/view/view.desktop"
// @ts-ignore
import { FlexLayout, NodeWidget, QGridLayout, QWidget } from "@nodegui/nodegui";
import { device } from "../../platform";
import { profile } from "../../profiling";
import {uniqId} from "../../utils/utils.desktop";

export * from "./page-common";

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

export class Page extends PageBase {
    public nativeViewProtected: QWidget;
    private _actionBarView: View;
    private _contentView: View;
    private _actionBarWidget: QWidget;
    private _contentWidget: QWidget;

    public createNativeView() {
        const view = new QWidget();
        view.setObjectName("root");
        view.setLayout(new FlexLayout());

        this._actionBarWidget = new QWidget;
        this._actionBarWidget.setObjectName(uniqId());
        this._actionBarWidget.setLayout(new FlexLayout());
        this._actionBarWidget.setInlineStyle("height: 60");

        this._contentWidget = new QWidget;
        this._contentWidget.setObjectName(uniqId());
        this._contentWidget.setLayout(new FlexLayout());
        this._contentWidget.setInlineStyle("flex: 1;");

        view.layout.addWidget(this._actionBarWidget);
        view.layout.addWidget(this._contentWidget);

        (<View><unknown>this).styles
            .set("padding-right", 17) // Probably scroller size?!
            .set("flex-direction", "column")
            .apply();

        return view;
    }

    public initNativeView(): void {
        super.initNativeView();
        //this.nativeViewProtected.setBackgroundColor(-1); // White color.
    }

    public _addViewToNativeVisualTree(view: View, atIndex?: number): boolean {
        let widget;

        if (this.nativeViewProtected && view.nativeViewProtected) {
            if (view instanceof ActionBar) {
                this._actionBarView = view;
                widget = this._actionBarWidget.layout.addWidget(view.nativeViewProtected);

                (<View>view).styles
                    .set("height", 60)
                    .apply();
            } else {
                this._contentView = view;
                widget = this._contentWidget.layout.addWidget(view.nativeViewProtected);

                (<View>this._contentView).styles
                    .set("flex", "1")
            }
        }

        return widget;
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
