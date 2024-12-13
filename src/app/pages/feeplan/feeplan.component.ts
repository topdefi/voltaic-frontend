import { Component, OnInit } from '@angular/core';
import { UserApiService } from 'api/user.api';
//import { IUserCreateByAdminParams } from 'interfaces/userapi-query';
//import { FormService } from 'services/form.service';
import { FormBuilder, Validators, FormArray,FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService} from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
//import { DefaultParams } from 'components/defaults.component';
import { StorageService } from 'services/storage.service';
import { not } from 'logical-not';
//import { IFeePalnData } from 'interfaces/user';




export interface IFeePlanItems {
    [feePlanId: string]: IFeePlanData | string[];
    'feePlansList': string[];
}
export interface IFeePlanData {
    [coin: string]: {
        totalFee:string; 
        config: [{userId: string; percentage: number}]
    } | string[];
    'coinsList': string[];
    'unusedCoinsList': string[];
}

export interface IFeeData {
    userId: string; 
    percentage: number
}
export interface IAddFeePlanForm {
    feePlanId: string;
    config: IFeeData[];
}
export interface IAddCoinFeeform {
    coin: string; 
    config: IFeeData[]
}

@Component({
    selector: 'app-feeplan',
    templateUrl: './feeplan.component.html',
    styleUrls: ['./feeplan.component.less'],
})

export class FeeplanComponent implements OnInit {



    feePlansForm: {
        [formId: string]: any;
    } = {} as any;
    
    feePlansCoinForm: {
        [coinId: string]: any;
    } = {} as any;

    currentFeePlanItem: string='';
    feePlansItems: IFeePlanItems={} as any;
    feePlanData: IFeePlanData={} as any;
    coinsList: any[];
    usersList: any[];
    expandFeePlansSet = new Set<string>();
    expandFeeDataSet = new Set<string>();

    onExpandFeePlansChange(feePlan: string, checked: boolean): void {
        if (this.expandFeePlansSet.size > 0) this.expandFeePlansSet.forEach(feePlan => this.expandFeePlansSet.delete(feePlan));
        if (this.expandFeeDataSet.size > 0) this.expandFeeDataSet.forEach(feeCoin => this.expandFeeDataSet.delete(feeCoin));
        if (checked) {
            this.expandFeePlansSet.add(feePlan);
        } else this.expandFeePlansSet.delete(feePlan);
    }

    onExpandFeeDataChange(feeCoin: string, checked: boolean): void {
        if (this.expandFeeDataSet.size > 0) this.expandFeeDataSet.forEach(feeCoin => this.expandFeeDataSet.delete(feeCoin));
        if (checked) {
            this.expandFeeDataSet.add(feeCoin);
        } else this.expandFeeDataSet.delete(feeCoin);
    }

    isSubmitting = false;

    constructor(
        private formBuilder: FormBuilder,
        private userApiService: UserApiService,
        //private formService: FormService,
        //private formBuilder: FormBuilder,
        //private formGroup: FormGroup,
        //private formArray: FormArray,
        private storageService: StorageService,
        private translateService: TranslateService,
        private nzModalService: NzModalService,
        private nzMessageService: NzMessageService,
            ) {    }    

    genPWD() {
        return;
    }
    getFeePlans() {
        //this.feePlansItems = [];
        this.coinsList= [];
        this.storageService.algosList.forEach(algo => {
            this.storageService.algoCoinsData[algo].forEach(coin => {
                if (coin.name !== coin.algorithm) this.coinsList.push(coin.name);
            });
        });

        this.usersList=[];
        this.storageService.trgUserData.forEach(user => {
            this.usersList.push(user.login);
        })

        this.userApiService.userEnumerateFeePlan({}).subscribe(
            ({ plans }) => {
                //debugger;
                this.feePlansItems['feePlansList']=[];
                plans.forEach(plan => {
                    this.feePlanData = {} as any;
                    this.feePlanData['coinsList']=[];
                    this.feePlanData['coinsList'].push('default');
                    let feeCount: number = 0;
                    plan.default.forEach(element => {
                        feeCount+=element.percentage;
                    });
                    this.feePlanData['default'] = {totalFee:feeCount.toFixed(2), config:plan.default};

                    plan.coinSpecificFee.forEach(specificFee => {
                        this.feePlanData['coinsList'].push(specificFee.coin);
                        feeCount=0;
                        specificFee.config.forEach(element => {
                            feeCount+=element.percentage;
                        });
                        this.feePlanData[specificFee.coin] = {totalFee:feeCount.toFixed(2), config:specificFee.config};
                    });
                    this.feePlanData.unusedCoinsList=[];
                    
                    this.coinsList.forEach(coin => {
                        let isUsed=false;
                        this.feePlanData['coinsList'].forEach(used => {
                            if (!isUsed && coin === used) isUsed=true;
                        });
                        if (!isUsed) this.feePlanData.unusedCoinsList.push(coin);
                    })

                    this.feePlansItems['feePlansList'].push(plan.feePlanId);
                    this.feePlansItems[plan.feePlanId]=this.feePlanData;

                    /*
                    
                    this.feePlansForm[plan.feePlanId] = this.formBuilder.group({
                        feePlanId: [plan.feePlanId, [Validators.required, Validators.maxLength(64)]],
                        default:this.formBuilder.array([this.createFeeData()],Validators.required),
                        coinSpecificFee:this.formBuilder.array(
                            [{
                                coin:['',Validators.required],
                                config:this.formBuilder.array([this.createFeeData()],Validators.required),
                            }])
                        //coinSpecificFee:this.formBuilder.array([this.createCoinSpecificFeeData()],Validators.required),
                      });
                      this.feePlansForm[plan.feePlanId].controls.feePlanId.setValue(plan.feePlanId)
                      plan.default.forEach(config => {
                        this.addDefaultFeeConfig(plan.feePlanId,config);
                      });
                      plan.coinSpecificFee.forEach(element => {
                        this.addCoinSpecificFeeData(plan.feePlanId, element.coin, element.config);
                      });
                      debugger;*/
                      //this.feePlansForm[plan.feePlanId].controls.default.setValue(plan.default)
                      //this.feePlansForm[plan.feePlanId].controls.coinSpecificFee.setValue(plan.coinSpecificFee)
                   
                });
            },
            (err) => {
            },
        );
    }
    addFeePlan(planId:string){

    }
    updateFeePlan(feePlanId:string, defaultData: any[], coinSpecData: any[]){

        let params= {
            feePlanId: feePlanId, 
            default: defaultData,
            coinSpecificFee: coinSpecData
        };
        if (not(params.coinSpecificFee)) delete params.coinSpecificFee;

        this.userApiService.userUpdateFeePlan(params).subscribe(
            () => {
                this.nzMessageService.success(
                    this.translateService.instant('actions.useractivate.error'),
                );
            },
            () => {
                this.nzMessageService.error(
                    this.translateService.instant('actions.useractivate.error'),
                );
            },
        );

    }
    /*
    get defaultFeeConfig():FormArray{
        return <FormArray> this.feePlansForm[this.currentFeePlanItem].get('default');
    }

    addDefaultFeeConfig(feePlanID:string, config:IFeeData) {
        this.currentFeePlanItem=feePlanID;
        this.defaultFeeConfig.push(this.createFeeData (config.percentage, config.userId));
    }

    get coinSpecificFeeData():FormArray{
        return <FormArray> this.feePlansForm[this.currentFeePlanItem].get('coinSpecificFee');
    }
    get coinSpecificFeeConfig():FormArray{
        return <FormArray> this.feePlansForm[this.currentFeePlanItem].coinSpecificFee.get('config');
    }
    
    add1CoinSpecificFeeData(feePlanID:string, coin: string, config:IFeeData[]) {
        
        let tmp=this.formBuilder.group({
            coin: [coin, [Validators.required]],
            config:this.formBuilder.array([this.createFeeData()],Validators.required),
        })
        get sssss (): FormArray {}
        config.forEach(config => {
            this.addDefaultFeeConfig(plan.feePlanId,config);
          });

        let arr = [];
        config.forEach(conf=>{
            arr.push(this.createFeeData(conf.percentage,conf.userId))
        })
        this.currentFeePlanItem=feePlanID;
        this.coinSpecificFeeData.push(this.createCoinSpecificFeeData (coin, arr as any));
    }


    createFeeData(percentage?:number|null, userId?:string|null):FormGroup{
        return this.formBuilder.group({
            percentage:[percentage,Validators.required],
            userId:[userId,Validators.required]
        })
      }
    create1CoinSpecificFeeData(coin?:string | null, formArray?: []|null):FormGroup{
        return this.formBuilder.group({
            coin:[coin,Validators.required],
            config:this.formBuilder.array([formArray],Validators.required)
        })
      }
   */

    ngOnInit() {
        this.getFeePlans();
        /*
        this.feePlansForm['newFeePlan'] = this.formBuilder.group({
            feePlanId: ['newFeePlan', [Validators.required, Validators.maxLength(64)]],
            default:this.formBuilder.array([this.createFeeData()],Validators.required),
            //coinSpecificFee:this.formBuilder.array([this.createCoinSpecificFeeData()],Validators.required),
            coinSpecificFee:this.formBuilder.array(
                [{
                    coin:['',Validators.required],
                    config:this.formBuilder.array([this.createFeeData()],Validators.required),
                }])
            //coinSpecificFee:this.formBuilder.group({
                //coin:['',Validators.required],
                //config:this.formBuilder.array([this.createFeeData()],Validators.required)
            //}),
            //([this.createCoinSpecificFeeData()],Validators.required),

          });
          */
    }
}
