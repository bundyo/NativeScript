import {
    ProgressBase, Color, valueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty
} from "./progress-common";
import { QProgressBar } from "@nodegui/nodegui";
import { View } from "../core/view/view.desktop";

export * from "./progress-common";

export class Progress extends ProgressBase {
    nativeViewProtected: QProgressBar;

    createNativeView() {
        return new QProgressBar();
    }

    get desktop() {
        return this.nativeViewProtected;
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this.desktop.setValue(value);
    }

    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this.desktop.setMaximum(value);
    }

    [colorProperty.getDefault]() {
        // return this.desktop.progressTintColor;
    }
    [colorProperty.setNative](value: Color) {
        (<View><unknown>this).styles.set("color", value instanceof Color ? value.desktop : value).apply();
    }

    [backgroundColorProperty.getDefault]() {
        // return this.desktop.trackTintColor;
    }
    [backgroundColorProperty.setNative](value: Color) {
        (<View><unknown>this).styles.set("background-color", value instanceof Color ? value.desktop : value).apply();
    }

    [backgroundInternalProperty.getDefault]() {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Color) {
        //
    }
}
