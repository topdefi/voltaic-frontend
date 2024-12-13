import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ZoomSwitchService } from 'services/zoomswitch.service';
import { StorageService } from 'services/storage.service';

import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-zoom-switcher',
    templateUrl: './zoom-switcher.component.html',
    styleUrls: ['./zoom-switcher.component.less'],
})
export class ZoomSwitcherComponent implements OnInit {
    @Output()
    onChange = new EventEmitter<string>();

    activeZoom: string;
    zooms: string[];
    zoomListReady: boolean;

    constructor(
        private zoomSwitchService: ZoomSwitchService,
        private storageService: StorageService,
    ) {}

    ngOnInit(): void {
        this.zoomListReady = false;
        const type = this.storageService.currType;
        this.activeZoom = DefaultParams.ZOOM[type];
        this.zooms = DefaultParams.ZOOMSLIST[type];
        this.zoomListReady = this.storageService.currentWorker === '';
        this.cangeZoom(this.activeZoom);
    }

    ngOnDestroy(): void {
        //this.fetchPoolDataService.getCoinsData.unsubscribe();
    }

    cangeZoom(newZoom: string) {
        if (newZoom === '') debugger;
        if (newZoom === undefined) debugger;
        if (newZoom === null) debugger;
        //if (this.storageService.currentWorker !== '') return;
        if (this.storageService.currZoom !== newZoom) this.storageService.currZoom = newZoom;
        this.zoomSwitchService.setZoom(newZoom);
        this.onChange.emit(newZoom);
    }
}
