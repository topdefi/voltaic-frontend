import { Injectable, EventEmitter } from "@angular/core";
import {
    FormBuilder,
    FormGroup,
    AbstractControl,
    ValidatorFn,
} from "@angular/forms";

import { TranslateService } from "@ngx-translate/core";
import { NzMessageService } from "ng-zorro-antd/message";

import { Observable, merge } from "rxjs";
import { map, debounceTime } from "rxjs/operators";

import { not } from "logical-not";

import { InvalidDataError } from "services/rest.service";

export interface IFormManager<T> {
    formData: FormGroup;
    errors: Record<keyof T, IFormErrors>;

    validate: () => void;
    submit: () => void;
    onError: (error: any) => void;
}

export interface IFormManagerOptions {
    onSubmit?: () => void;
}

export interface IFormControlSettings {
    validators?: ValidatorFn[];
    errors?: string[];
}

export interface IFormErrors {
    status: Observable<string>;
    error: Observable<string>;
}

enum EErrorState {
    Show = 1,
    Hide,
}

@Injectable({ providedIn: "root" })
export class FormService {
    private showErrorMessage = new EventEmitter<string>();

    constructor(
        private formBuilder: FormBuilder,
        private translateService: TranslateService,
        private nzMessageService: NzMessageService,
    ) {
        this.showErrorMessage.pipe(debounceTime(50)).subscribe(message => {
            this.nzMessageService.error(message);
        });
    }

    createFormManager<T>(
        controls: Record<keyof T, IFormControlSettings>,
        options?: IFormManagerOptions,
    ): IFormManager<T> {
        const formSource: { [key: string]: any } = {};
        const controlNamesByError: { [error: string]: string[] } = {};

        Object.entries(controls).forEach(
            ([controlName, settings]: [string, IFormControlSettings]) => {
                formSource[controlName] = ["", settings.validators];

                if (Array.isArray(settings.errors)) {
                    settings.errors.forEach(error => {
                        if (not(error in controlNamesByError)) {
                            controlNamesByError[error] = [];
                        }

                        if (
                            not(
                                controlNamesByError[error].includes(
                                    controlName,
                                ),
                            )
                        ) {
                            controlNamesByError[error].push(controlName);
                        }
                    });
                }
            },
        );

        const form = this.formBuilder.group(formSource);

        const errors = {} as Record<keyof T, IFormErrors>;

        const validate = new EventEmitter<void>();
        const onError = new EventEmitter<any>();

        Object.entries(form.controls).forEach(([name, control]) => {
            errors[name] = {
                status: merge(
                    control.valueChanges.pipe(map(() => EErrorState.Hide)),
                    validate.pipe(
                        map(() =>
                            control.invalid
                                ? EErrorState.Show
                                : EErrorState.Hide,
                        ),
                    ),
                    onError.pipe(
                        map(error =>
                            error instanceof InvalidDataError &&
                            controlNamesByError[error.message]?.includes(name)
                                ? EErrorState.Show
                                : EErrorState.Hide,
                        ),
                    ),
                ).pipe(
                    map(event => {
                        switch (event) {
                            case EErrorState.Hide:
                                return "success";
                            case EErrorState.Show:
                                return "error";
                        }
                    }),
                ),
                error: merge(
                    validate.pipe(map(() => this.getErrorMessage(control))),
                    onError.pipe(
                        map(error => {
                            if (error instanceof InvalidDataError) {
                                if (
                                    controlNamesByError[
                                        error.message
                                    ]?.includes(name)
                                ) {
                                    return this.createErrorMessage(
                                        "serverError",
                                        error.message,
                                    );
                                }

                                if (
                                    controlNamesByError["unknown"]?.includes(
                                        name,
                                    )
                                ) {
                                    return this.createErrorMessage(
                                        "serverError",
                                        "unknown",
                                    );
                                }

                                return "";
                            } else {
                                this.showErrorMessage.emit(
                                    this.translateService.instant(
                                        "common.api.unhandledError",
                                    ),
                                );
                            }

                            return "";
                        }),
                    ),
                ),
            } as IFormErrors;
        });

        const formManager = {
            formData: form,
            errors,

            submit() {
                validate.emit();

                if (form.valid && options) {
                    const { onSubmit } = options;

                    if (typeof onSubmit === "function") {
                        onSubmit();
                    }
                }
            },
            validate() {
                validate.emit();
            },
            onError(error: any) {
                onError.emit(error);
            },
        } as IFormManager<T>;

        return formManager;
    }

    private getErrorMessage(control: AbstractControl): string {
        if (control.valid) return "";

        for (let error in control.errors) {
            const payload = control.errors[error];

            return this.createErrorMessage("clientError", error, payload);
        }

        return this.translateService.instant("validation.unknownError");
    }

    private createErrorMessage(
        source: string,
        type: string,
        params?: any,
    ): string {
        const key = `validation.${source}.${type}`;

        const message = this.translateService.instant(key, params);

        return message !== key
            ? message
            : this.translateService.instant("validation.unknownError");
    }
}
