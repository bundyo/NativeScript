import {
    ButtonBase, PseudoClassHandler,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty,
    Length, zIndexProperty, textAlignmentProperty, TextAlignment
} from "./button-common";
import { profile } from "../../profiling";
import { TouchGestureEventData, GestureTypes, TouchAction } from "../gestures";
import { device } from "../../platform";
import lazy from "../../utils/lazy";
import {QPushButton} from "@nodegui/nodegui";
import {uniqId} from "../../utils/utils.desktop";

export * from "./button-common";

const sdkVersion = lazy(() => parseInt(device.sdkVersion));

let ClickListener: any;
let APILEVEL: number;
//let AndroidButton: typeof android.widget.Button;

function initializeClickListener(): void {
    if (ClickListener) {
        return;
    }

    class ClickListenerImpl {
        private owner: any;

        constructor(owner) {
            this.owner = owner;
        }

        public onClick(v): void {
            if (this.owner) {
                this.owner._emit(ButtonBase.tapEvent);
            }
        }
    }

    ClickListener = ClickListenerImpl;
}

export class Button extends ButtonBase {
    nativeViewProtected: QPushButton;

    private _stateListAnimator: any;
    private _highlightedHandler: (args: TouchGestureEventData) => void;

    @profile
    public createNativeView() {
        // if (!AndroidButton) {
        //     AndroidButton = android.widget.Button;
        // }

        const button = new QPushButton();
        button.setObjectName(uniqId());
        // button.setInlineStyle("background-color: green");

        return button; // new AndroidButton(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        initializeClickListener();
        const clickListener = new ClickListener(this);
        nativeView.addEventListener("clicked", clickListener.onClick.bind(clickListener));
        (<any>nativeView).clickListener = clickListener;
    }

    public disposeNativeView() {
        if (this.nativeViewProtected) {
            (<any>this.nativeViewProtected).clickListener.owner = null;
        }
        super.disposeNativeView();
    }

    public resetNativeView(): void {
        super.resetNativeView();

        // if (this._stateListAnimator && APILEVEL >= 21) {
        //     (<any>this.nativeViewProtected).setStateListAnimator(this._stateListAnimator);
        //     this._stateListAnimator = undefined;
        // }
    }

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateButtonStateChangeHandler(subscribe: boolean) {
        if (subscribe) {
            this._highlightedHandler = this._highlightedHandler || ((args: TouchGestureEventData) => {
                switch (args.action) {
                    case TouchAction.up:
                    case TouchAction.cancel:
                        this._goToVisualState("normal");
                        break;
                    case TouchAction.down:
                        this._goToVisualState("highlighted");
                        break;
                }
            });
            this.on(GestureTypes.touch, this._highlightedHandler);
        } else {
            this.off(GestureTypes.touch, this._highlightedHandler);
        }
    }

    // [paddingTopProperty.getDefault](): Length {
    //     return { value: this._defaultPaddingTop, unit: "px" };
    // }
    // [paddingTopProperty.setNative](value: Length) {
    //     this.nativeViewProtected.setInlineStyle(`padding-top: ${value}`);
    // }
    //
    // [paddingRightProperty.getDefault](): Length {
    //     return { value: this._defaultPaddingRight, unit: "px" };
    // }
    // [paddingRightProperty.setNative](value: Length) {
    //     this.nativeViewProtected.setInlineStyle(`padding-right: ${value}`);
    // }
    //
    // [paddingBottomProperty.getDefault](): Length {
    //     return { value: this._defaultPaddingBottom, unit: "px" };
    // }
    // [paddingBottomProperty.setNative](value: Length) {
    //     this.nativeViewProtected.setInlineStyle(`padding-bottom: ${value}`);
    // }
    //
    // [paddingLeftProperty.getDefault](): Length {
    //     return { value: this._defaultPaddingLeft, unit: "px" };
    // }
    // [paddingLeftProperty.setNative](value: Length) {
    //     this.nativeViewProtected.setInlineStyle(`padding-left: ${value}`);
    // }

    [zIndexProperty.setNative](value: number) {
        // API >= 21
        // if (APILEVEL >= 21) {
        //     const nativeView = this.nativeViewProtected;
        //     if (!this._stateListAnimator) {
        //         this._stateListAnimator = (<any>nativeView).getStateListAnimator();
        //     }
        //     (<any>nativeView).setStateListAnimator(null);
        // }
        //
        // org.nativescript.widgets.ViewHelper.setZIndex(this.nativeViewProtected, value);
    }

    [textAlignmentProperty.setNative](value: TextAlignment) {
        // Button initial value is center.
        const newValue = value === "initial" ? "center" : value;
        super[textAlignmentProperty.setNative](newValue);
    }

    protected getDefaultElevation(): number {
        if (sdkVersion() < 21) {
            return 0;
        }

        // NOTE: Button widget has StateListAnimator that defines the elevation value and
        // at the time of the getDefault() query the animator is not applied yet so we
        // return the hardcoded @dimen/button_elevation_material value 2dp here instead
        return 2;
    }

    protected getDefaultDynamicElevationOffset(): number {
        if (sdkVersion() < 21) {
            return 0;
        }

        return 4; // 4dp @dimen/button_pressed_z_material
    }
}
