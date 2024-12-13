import { Component } from '@angular/core';
//import { TranslateService } from '@ngx-translate/core';
import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-math',
    templateUrl: './math.component.html',
    styleUrls: ['./math.component.less'],
})
export class MathComponent {
    constructor() {}

    emailAddr = DefaultParams.SUPPORTMAIL;
    ppdalnReward = DefaultParams.PPDALNREWARD;
    etcReward = DefaultParams.PPDALNREWARDETC;
    onClick(type: string): void {
        switch (type) {
            case 'wiki':
                window.open(DefaultParams.BTCWIKI, '_system');
                break;
            case 'ppda':
                window.open(DefaultParams.PPDA + DefaultParams.DNSNAME, '_system');
                break;
            case 'ppdaln':
                window.open(DefaultParams.PPDALN + DefaultParams.DNSNAME, '_system');
                break;
            case 'discord':
                window.open(DefaultParams.DISCORDSERVER, '_system');
                break;
            default:
                break;
        }
    }
}
