<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatBillingOtherCharges;
use common\models\CoChargePerCategory;
use common\models\PatConsultant;
use common\models\PatProcedure;
use common\models\VBillingRecurring;
use common\models\PatBillingExtraConcession;
use common\models\PhaSale;
use common\models\PhaSaleBilling;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;
use yii\helpers\Html;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientbillingotherchargeController extends ActiveController {

    public $modelClass = 'common\models\PatBillingOtherCharges';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatBillingOtherCharges::find()->where(['other_charge_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionBulkinsert() {
        $post = Yii::$app->getRequest()->post();
        $model = new PatBillingOtherCharges();
        $model->attributes = $post;
        $model->encounter_id = $post['patient'][0]['encounter_id'];
        $valid = $model->validate();
        if ($valid) {
            foreach ($post['patient'] as $value) {
                $model = new PatBillingOtherCharges();
                $model->attributes = $post;
                $model->encounter_id = $value['encounter_id'];
                $model->patient_id = $value['patient_id'];
                $valid = $model->validate();
                if (!$valid) {
                    $error_message = "The combination has already been taken this patient " . $value['patient_name'];
                    return ['success' => false, 'message' => $error_message];
                }
            }
            foreach ($post['patient'] as $value) {
                $model = new PatBillingOtherCharges();
                $model->attributes = $post;
                $model->encounter_id = $value['encounter_id'];
                $model->patient_id = $value['patient_id'];
                $model->save();
            }
            return ['success' => true];
        } else {
            return ['success' => false, 'message' => Html::errorSummary($model)];
        }
    }

    public function actionGetotherchargeamount() {
        $post = Yii::$app->getRequest()->post();
        if ($post['encounter_type'] == 'IP')
            $category = $post['room_category'];
        else
            $category = $post['pat_category'];
        return $charge_amount = CoChargePerCategory::getChargeAmount($post['charge_category'], 'C', $post['charge_sub_category'], $post['encounter_type'], $category);
    }

    public function actionGetallothercharges() {
        $post = Yii::$app->getRequest()->post();
        $data = PatBillingOtherCharges::find()->where(['other_charge_id' => $post['id']])->one();
        if (!empty($data)) {
            $allCharges = PatBillingOtherCharges::find()
                    ->status()
                    ->active()
                    ->where(['charge_cat_id' => '2', 'encounter_id' => $data['encounter_id'], 'charge_subcat_id' => $data['charge_subcat_id']])
                    ->all();
            return $allCharges;
        }
    }

    public function actionUpdatecharges() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $model = new PatBillingOtherCharges;
            $model->attributes = $post['data'];
            $valid = $model->validate();
            if ($valid) {
                foreach ($post['sub_data'] as $data) {
                    $otherchargeItem = PatBillingOtherCharges::find()->tenant()->andWhere(['other_charge_id' => $data['other_charge_id']])->one();
                    $otherchargeItem->charge_amount = $data['charge_amount'];
                    $otherchargeItem->charge_cat_id = $post['data']['charge_cat_id'];
                    $otherchargeItem->charge_subcat_id = $post['data']['charge_subcat_id'];
                    $otherchargeItem->save(false);
                }
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary($model)];
            }
        }
    }

    public function actionGetcharges() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $tenant_ids = join("','", $post['tenant_id']);
            $billingOthercharges = PatBillingOtherCharges::find()
                    ->select(['sum(charge_amount) as charge_amount', 'pat_billing_other_charges.tenant_id'])
                    ->addSelect(["co_room_charge_category.charge_cat_name as charge_category"])
                    ->addSelect(["co_room_charge_subcategory.charge_subcat_name as charge_sub_category"])
                    ->addSelect(["co_tenant.tenant_name as branch_name"])
                    ->joinWith(['admission', 'chargeCat', 'chargeSubcat', 'tenant'])
                    ->andWhere("pat_billing_other_charges.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("date(pat_billing_other_charges.created_at) between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_admission.admission_status='D'")
                    ->groupBy(['pat_billing_other_charges.charge_cat_id', 'pat_billing_other_charges.charge_subcat_id'])
                    ->all();
            $otherCharges = [];
            foreach ($billingOthercharges as $key => $charges) {
                $otherCharges[$key]['amount'] = $charges['charge_amount'];
                $otherCharges[$key]['charge_category'] = $charges['charge_category'];
                $otherCharges[$key]['charge_sub_category'] = $charges['charge_sub_category'];
                $otherCharges[$key]['tenant_name'] = $charges['branch_name'];
                $otherCharges[$key]['tenant_id'] = $charges['tenant_id'];
            }

            $consultant = PatConsultant::find()
                    ->select(['sum(charge_amount) as charge_amount', 'pat_consultant.tenant_id'])
                    ->joinWith(['admission', 'tenant', 'consultant'])
                    ->addSelect(["co_tenant.tenant_name as branch_name"])
                    ->addSelect(["concat(co_user.title_code,co_user.name) as report_consultant_name"])
                    ->andWhere("pat_consultant.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("date(consult_date) between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_admission.admission_status='D'")
                    ->groupBy(['pat_consultant.consultant_id'])
                    ->all();
            $consultantCharges = [];
            foreach ($consultant as $key => $charges) {
                $consultantCharges[$key]['amount'] = $charges['charge_amount'];
                $consultantCharges[$key]['charge_category'] = 'Professional charges';
                $consultantCharges[$key]['charge_sub_category'] = $charges['report_consultant_name'];
                $consultantCharges[$key]['tenant_name'] = $charges['branch_name'];
                $consultantCharges[$key]['tenant_id'] = $charges['tenant_id'];
            }

            $procedure = PatProcedure::find()
                    ->select(['sum(charge_amount) as charge_amount', 'pat_procedure.tenant_id'])
                    ->joinWith(['admission', 'tenant', 'chargeCat'])
                    ->addSelect(["co_tenant.tenant_name as branch_name"])
                    ->addSelect(["co_room_charge_subcategory.charge_subcat_name as charge_sub_category"])
                    ->andWhere("pat_procedure.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("date(proc_date) between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_admission.admission_status='D'")
                    ->groupBy(['pat_procedure.charge_subcat_id'])
                    ->all();
            $procedureCharges = [];
            foreach ($procedure as $key => $charges) {
                $procedureCharges[$key]['amount'] = $charges['charge_amount'];
                $procedureCharges[$key]['charge_category'] = 'Procedure charges';
                $procedureCharges[$key]['charge_sub_category'] = $charges['charge_sub_category'];
                $procedureCharges[$key]['tenant_name'] = $charges['branch_name'];
                $procedureCharges[$key]['tenant_id'] = $charges['tenant_id'];
            }

            $non_recurring = array();
            if (is_array($otherCharges))
                $non_recurring = array_merge($non_recurring, $otherCharges);
            if (is_array($consultantCharges))
                $non_recurring = array_merge($non_recurring, $consultantCharges);
            if (is_array($procedureCharges))
                $non_recurring = array_merge($non_recurring, $procedureCharges);
            return ['non_recurring' => $non_recurring];
        }
    }

    public function actionGetrecurringcharges() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $tenant_ids = join("','", $post['tenant_id']);
            $report = \common\models\PatBillingRecurring::find()
                    ->joinWith(['admission'])
                    ->andWhere("pat_billing_recurring.tenant_id IN ( '$tenant_ids' )")
                    ->andWhere("recurr_date between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere("pat_admission.admission_status='D'")
                    ->all();
            return ['report' => $report];
        }
    }

    public function actionGetipbilldetails() {
        $get = Yii::$app->getRequest()->get();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        //Get recurring bill details
        $recurring = VBillingRecurring::find()
                        ->where([
                            'encounter_id' => $get['encounter_id'],
                            //'tenant_id' => $tenant_id
                        ])
                        ->select('SUM(total_charge) as total_charge')->one();
        $encounter = \common\models\PatEncounter::find()
                        ->select(['recurring_settlement as total_amount'])
                        ->addSelect(['concession_amount as concession_amount'])
                        ->where(['encounter_id' => $get['encounter_id']])->one();
        $total_charage = $recurring['total_charge'] - (int) $encounter['concession_amount'];
        $recurring = $total_charage - $encounter['total_amount'];

        //Get Professional Charges
        $consultant = PatConsultant::find()
                ->select(['sum(charge_amount) as report_total_charge_amount', 'COUNT(pat_consult_id) AS report_total_visit', 'IFNULL(TRUNCATE(AVG(charge_amount),2),0) AS charge_amount', 'consultant_id'])
                ->joinWith(['consultant'])
                ->addSelect(["concat(co_user.title_code,co_user.name) as report_consultant_name"])
                ->andWhere("encounter_id=" . $get['encounter_id'] . "")
                ->andWhere(['settlement' => null])
                ->andWhere(['pat_consultant.deleted_at' => '0000-00-00 00:00:00'])
                ->groupBy(['pat_consultant.consultant_id'])
                ->all();
        $professional = [];
        foreach ($consultant as $key => $charges) {
            $professional[$key]['amount'] = $charges['charge_amount'];
            $professional[$key]['consultant_name'] = $charges['report_consultant_name'];
            $professional[$key]['total_visit'] = $charges['report_total_visit'];
            $professional[$key]['total_charge_amount'] = $charges['report_total_charge_amount'];
            $professional[$key]['consultant_id'] = $charges['consultant_id'];
            $professional[$key]['extra_amount'] = '0';
            $professional[$key]['concession_amount'] = '0';
            $extraConcession = PatBillingExtraConcession::find()
                            ->andWhere([
                                'encounter_id' => $get['encounter_id'],
                                'ec_type' => 'C',
                                'link_id' => $charges['consultant_id']
                            ])->one();
            if (!empty($extraConcession)) {
                $professional[$key]['extra_amount'] = $extraConcession['extra_amount'];
                $professional[$key]['concession_amount'] = $extraConcession['concession_amount'];
            }
        }

        //Get Procedure Charges
        $procedureCharges = PatProcedure::find()
                ->select(['sum(charge_amount) as total_charge_amount', 'COUNT(proc_id) AS total_visit', 'IFNULL(TRUNCATE(AVG(charge_amount),2),0) AS charge_amount', 'pat_procedure.charge_subcat_id'])
                ->joinWith(['chargeCat'])
                ->addSelect(["co_room_charge_subcategory.charge_subcat_name as charge_sub_category"])
                ->andWhere("encounter_id=" . $get['encounter_id'] . "")
                ->andWhere(['settlement' => null])
                ->andWhere(['pat_procedure.deleted_at' => '0000-00-00 00:00:00'])
                ->groupBy(['pat_procedure.charge_subcat_id'])
                ->all();
        $procedure = [];
        foreach ($procedureCharges as $key => $charges) {
            $procedure[$key]['amount'] = $charges['charge_amount'];
            $procedure[$key]['charge_sub_category'] = $charges['charge_sub_category'];
            $procedure[$key]['total_visit'] = $charges['total_visit'];
            $procedure[$key]['total_charge_amount'] = $charges['total_charge_amount'];
            $procedure[$key]['charge_subcat_id'] = $charges['charge_subcat_id'];
            $procedure[$key]['extra_amount'] = '0';
            $procedure[$key]['concession_amount'] = '0';
            $extraConcession = PatBillingExtraConcession::find()
                            ->andWhere([
                                'encounter_id' => $get['encounter_id'],
                                'ec_type' => 'P',
                                'link_id' => $charges['charge_subcat_id']
                            ])->one();
            if (!empty($extraConcession)) {
                $procedure[$key]['extra_amount'] = $extraConcession['extra_amount'];
                $procedure[$key]['concession_amount'] = $extraConcession['concession_amount'];
            }
        }

        //Get Other Charges
        $billingOthercharges = PatBillingOtherCharges::find()
                ->select(['sum(charge_amount) as total_charge_amount', 'COUNT(other_charge_id) AS total_visit', 'IFNULL(TRUNCATE(AVG(charge_amount),2),0) AS charge_amount', 'pat_billing_other_charges.charge_subcat_id'])
                ->addSelect(["co_room_charge_category.charge_cat_name as charge_category"])
                ->addSelect(["co_room_charge_subcategory.charge_subcat_name as charge_sub_category"])
                ->andWhere("encounter_id=" . $get['encounter_id'] . "")
                ->joinWith(['chargeCat', 'chargeSubcat'])
                ->andWhere(['settlement' => null])
                ->andWhere(['pat_billing_other_charges.deleted_at' => '0000-00-00 00:00:00'])
                ->groupBy(['pat_billing_other_charges.charge_cat_id', 'pat_billing_other_charges.charge_subcat_id'])
                ->all();
        $otherCharges = [];
        foreach ($billingOthercharges as $key => $charges) {
            $otherCharges[$key]['amount'] = $charges['charge_amount'];
            $otherCharges[$key]['charge_category'] = $charges['charge_category'];
            $otherCharges[$key]['charge_sub_category'] = $charges['charge_sub_category'];
            $otherCharges[$key]['total_visit'] = $charges['total_visit'];
            $otherCharges[$key]['total_charge_amount'] = $charges['total_charge_amount'];
            $otherCharges[$key]['charge_subcat_id'] = $charges['charge_subcat_id'];
        }

        //Get Pharmacy Pending Charges
        $pharmacyCharges = PhaSale::find()
                ->andWhere(['!=', 'payment_status', 'C'])
                ->andWhere(['encounter_id' => $get['encounter_id']])
                ->all();

        //Get WriteOff amount in Sale
        $writeoffAmount = $this->_getWriteoffamount($get['encounter_id'], $tenant_id);

        return ['recurring' => $recurring, 'professional' => $professional, 'procedure' => $procedure,
            'otherCharges' => $otherCharges, 'pharmacyCharges' => $pharmacyCharges, 'writeoffAmount' => $writeoffAmount];
    }

    private function _getWriteoffamount($encounter_id, $tenant_id) {
        //Get Encounter Write Off Amount
        $encounter = \common\models\PatEncounter::find()
                        ->select(['recurring_settlement as total_amount'])
                        ->where(['encounter_id' => $encounter_id])->one();
        $encounter_write_off_amount = $encounter['total_amount'];

        //Get Pharmacy Write Off Amount
        $pharmacy_write_off_amount = 0;
        $PharmacyBill = PhaSaleBilling::find()
                ->select(['sum(paid_amount) as total_amount'])
                ->joinWith(['sale'])
                ->andWhere(['pha_sale.encounter_id' => $encounter_id])
                ->one();
        if (!empty($PharmacyBill)) {
            $pharmacy_write_off_amount = $PharmacyBill['total_amount'];
        }

        //Get Procedure Write Off Amount
        $procedure_write_off_amount = 0;
        $procedureCharges = PatProcedure::find()
                ->select(['sum(charge_amount) as total_charge_amount'])
                ->andWhere("encounter_id=" . $encounter_id . "")
                ->andWhere(['settlement' => 'S'])
                ->groupBy(['pat_procedure.charge_subcat_id'])
                ->one();
        if (!empty($procedureCharges)) {
            $procedure_write_off_amount = $procedureCharges['total_charge_amount'];
            $extraConcession = PatBillingExtraConcession::find()->andWhere(['encounter_id' => $encounter_id, 'ec_type' => 'P',])->one();
            if (!empty($extraConcession)) {
                $procedure_write_off_amount = $procedure_write_off_amount + (int) $extraConcession['extra_amount'] - (int) $extraConcession['concession_amount'];
            }
        }

        //Get Consultant Write Off Amount
        $consultant_write_off_amount = 0;
        $consultantCharges = PatConsultant::find()
                ->select(['sum(charge_amount) as report_total_charge_amount'])
                ->andWhere("encounter_id=" . $encounter_id . "")
                ->andWhere(['settlement' => 'S'])
                ->one();
        if (!empty($consultantCharges)) {
            $consultant_write_off_amount = $consultantCharges['report_total_charge_amount'];
            $extraConcession = PatBillingExtraConcession::find()->andWhere(['encounter_id' => $encounter_id, 'ec_type' => 'C'])->one();
            if (!empty($extraConcession)) {
                $consultant_write_off_amount = $consultant_write_off_amount + (int) $extraConcession['extra_amount'] - (int) $extraConcession['concession_amount'];
            }
        }

        //Get Other Charges write Off amount
        $billing_write_off_amount = 0;
        $billingCharges = PatBillingOtherCharges::find()
                ->select(['sum(charge_amount) as total_charge_amount'])
                ->andWhere("encounter_id=" . $encounter_id . "")
                ->andWhere(['settlement' => 'S'])
                ->one();
        if (!empty($billingCharges)) {
            $billing_write_off_amount = $billingCharges['total_charge_amount'];
        }

        $write_off_amount = $encounter_write_off_amount + $pharmacy_write_off_amount + $procedure_write_off_amount + $consultant_write_off_amount + $billing_write_off_amount;
        return $write_off_amount;
    }

}
