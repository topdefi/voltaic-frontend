import { Component } from '@angular/core';
import { EAppRoutes } from 'enums/routing';

@Component({
    selector: 'app-terms',
    templateUrl: './terms.component.html',
    styleUrls: ['./terms.component.less'],
})
export class TermsComponent {
    readonly EAppRoutes = EAppRoutes;
}
