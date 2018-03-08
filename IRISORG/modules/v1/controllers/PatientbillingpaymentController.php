<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatBillingLog;
use common\models\PatBillingPayment;
use common\models\PatPatient;
use common\models\PhaSale;
use common\models\PhaSaleBilling;
use common\models\CoAuditLog;
use common\models\PatProcedure;
use common\models\PatConsultant;
use common\models\PatBillingOtherCharges;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientbillingpaymentController extends ActiveController {

    public $modelClass = 'common\models\PatBillingPayment';

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
            $model = PatBillingPayment::find()->where(['payment_id' => $id])->one();
            $model->remove();
            $activity = 'Billing payment Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatBillingPayment::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionBillinghistory() {
        $GET = Yii::$app->getRequest()->get();

        if (!empty($GET)) {
            $patient = PatPatient::getPatientByGuid($GET['id']);

            $condition['patient_id'] = $patient->patient_id;
            $condition['encounter_id'] = $GET['enc_id'];

            $data = PatBillingLog::find()
                    ->tenant()
                    ->active()
                    ->status()
                    ->andWhere($condition)
                    ->orderBy(['date_time' => SORT_DESC])
                    ->all();

            return ['success' => true, 'result' => $data];
        }
    }

    public function actionSavesettlementbill() {
        $post = Yii::$app->getRequest()->post();

        $encounter_id = $post['encounter_id'];
        if (isset($post['procedure_id']) && !empty($post['procedure_id'])) {
            $subcat_ids = join("','", $post['procedure_id']);
            $procedure = PatProcedure::updateAll(['settlement' => 'S'], "encounter_id = $encounter_id AND `charge_subcat_id` IN ('$subcat_ids')");
            foreach ($post['procedure_id'] as $key => $value) {
                $activity = 'Procedure Charge Write Off Added Successfully (#' . $encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatProcedure::tableName(), $value, $activity);
            }
        }

        if (isset($post['professional_id']) && !empty($post['professional_id'])) {
            $professional_ids = join("','", $post['professional_id']);
            $procedure = PatConsultant::updateAll(['settlement' => 'S'], "encounter_id = $encounter_id AND `consultant_id` IN ('$professional_ids')");
            foreach ($post['professional_id'] as $key => $value) {
                $activity = 'Professional Charge Write Off Added Successfully (#' . $encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatConsultant::tableName(), $value, $activity);
            }
        }

        if (isset($post['othercharges_id']) && !empty($post['othercharges_id'])) {
            $subcat_ids = join("','", $post['othercharges_id']);
            $procedure = PatBillingOtherCharges::updateAll(['settlement' => 'S'], "encounter_id = $encounter_id AND `charge_subcat_id` IN ('$subcat_ids')");
            foreach ($post['othercharges_id'] as $key => $value) {
                $activity = 'Other Charge Write Off Added Successfully (#' . $encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatBillingOtherCharges::tableName(), $value, $activity);
            }
        }

        if (isset($post['recurring']) && $post['recurring'] == '1') {
            $encounter = \common\models\PatEncounter::find()->andWhere(['encounter_id' => $encounter_id])->one();
            if (!$encounter->recurring_settlement) {
                $encounter->recurring_settlement = '0';
            }
            $encounter->recurring_settlement = $encounter->recurring_settlement + $post['recurring_amount'];
            $encounter->save(false);
        }

        if ($post['paid_amount'] != '0') {
            $model = new PatBillingPayment;
            $model->attributes = $post;
            $model->payment_amount = $post['paid_amount'];
            $model->category = 'S';
            $model->save();
        }
        
        if (isset($post['pharmacy_id']) && !empty($post['pharmacy_id'])) {
            $sale_id = join(",", $post['pharmacy_id']);
            $sales = PhaSale::find()->where("sale_id IN ($sale_id)")->all();
            foreach ($sales as $key => $sale) {
                $model = new PhaSaleBilling;
                $model->sale_id = $sale->sale_id;
                $model->paid_amount = $sale->bill_amount - $sale->PhaSaleBillingsTotalPaidAmount;
                $model->paid_date = date("Y-m-d");
                $model->tenant_id = $sale->tenant_id;
                $model->settlement = 'S';
                $model->save(false);
            }
        }

//        $post = Yii::$app->getRequest()->post();
//        if (in_array("purchase", $post['bills']) && $post['pharmacy_paid_amount'] != 0)
//            PhaSale::billpayment($post['pharmacy_sale_id'], $post['pharmacy_paid_amount'], $post['payment_date']);
//        if (in_array("billing", $post['bills']) && $post['billing_paid_amount'] != 0) {
//            $model = new PatBillingPayment;
//            $model->attributes = [
//                'encounter_id' => $post['encounter_id'],
//                'patient_id' => $post['patient_id'],
//                'payment_date' => $post['payment_date'],
//                'payment_mode' => $post['payment_mode'],
//                'payment_amount' => $post['billing_paid_amount'],
//                'category' => 'S',
//            ];
//            $model->save();
//        }
//        return ['success' => true];
    }

    public function actionGetincomereport() {
        $post = Yii::$app->getRequest()->post();

        $model = PatBillingPayment::find()->active();
        if (isset($post['from']) && isset($post['tenant_id'])) {
            $tenant_ids = join("','", $post['tenant_id']);
            $model->andWhere("DATE(payment_date) between '{$post['from']}' AND '{$post['to']}'");
            $model->andWhere("tenant_id IN ( '$tenant_ids' )");
        }
        $reports = $model->all();
        return ['report' => $reports];
    }

}
