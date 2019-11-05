import { StackLayoutBase, orientationProperty } from "./stack-layout-common";
import { FlexLayout, QWidget } from "@nodegui/nodegui";
import { uniqId } from "../../../utils/utils.desktop";
import { View } from "../../core/view";

export * from "./stack-layout-common";

export class StackLayout extends StackLayoutBase {
    nativeViewProtected: QWidget;
    private _layout: FlexLayout;

    public createNativeView() {
        const view = new QWidget();
        this._layout = new FlexLayout();
        view.setObjectName(uniqId());
        view.setLayout(this._layout);
        view.setInlineStyle("flex-direction: column");

        return view; //new org.nativescript.widgets.StackLayout(this._context);
    }

    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this.nativeViewProtected.setInlineStyle(`flex-direction: ${value === "vertical" ? "column" : "row"}`);
    }
}
