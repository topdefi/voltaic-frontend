import { Injectable, Component, OnInit, Output, EventEmitter } from '@angular/core';
//import { timeUnits } from 'ng-zorro-antd/core/time';
import { StorageService } from 'services/storage.service';

@Injectable({
    providedIn: 'root',
})
@Component({
    selector: 'app-target-login-badge',
    templateUrl: './target-login-badge.component.html',
    styleUrls: ['./target-login-badge.component.less'],
})
export class TargetLoginBadgeComponent implements OnInit {
    @Output()
    onTargetChange = new EventEmitter<string>();

    usersItems: any;
    selectedIndex: number;
    isReady: boolean;
    constructor(private storageService: StorageService) {}

    ngOnInit() {
        if (
            this.storageService.allUsersData === null ||
            this.storageService.allUsersData === undefined ||
            this.storageService.allUsersData.length === 0
        ) {
            this.isReady = false;
            return;
        }
        this.usersItems = this.storageService.allUsersData;
        this.selectedIndex = this.storageService.allUsersData.findIndex(
            user => user.login === this.storageService.targetUser,
        );
        this.isReady = true;
    }

    onUserChange(): void {
        this.storageService.targetUser = this.usersItems[this.selectedIndex].login;
        this.onTargetChange.emit(this.storageService.targetUser);
    }
}
