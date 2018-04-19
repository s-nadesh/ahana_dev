<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaSale;
use common\models\PhaSaleBilling;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacysalebillingController extends ActiveController {

    public $modelClass = 'common\models\PhaSaleBilling';

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
            $model = PhaSaleBilling::find()->where(['sale_billing_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionMakepayment() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post) && !empty($post['sale_ids'])) {
            $model = new PhaSaleBilling;
            $model->attributes = $post;
            $valid = $model->validate();
            if ($post['total_select_bill_amount'] < $post['paid_amount'])
                return ['success' => false, 'message' => 'Kindly check amount'];

            if ($valid) {
                PhaSale::billpayment($post['sale_ids'], $post['paid_amount'], $post['paid_date'], $post);

                //$search = ['encounter_id' => $post['encounter_id'], 'payment_type' => $post['payment_type'], 'patient_id' => $sales[0]->patient_id];

                $data = [];
                //$sales = PhaSale::find()->tenant()->active()->andWhere($search)->groupBy(['encounter_id'])->all();
//                foreach ($sales as $key => $sale) {
//                    $data[$key] = $sale->attributes;
//
//                    $sale_item = PhaSale::find()->tenant()->andWhere($search);
//
//                    $sale_ids = ArrayHelper::map($sale_item->all(), 'sale_id', 'sale_id');
//                    $sum_paid_amount = PhaSaleBilling::find()->tenant()->andWhere(['sale_id' => $sale_ids])->sum('paid_amount');
//
//                    $data[$key]['items'] = $sale_item->all();
//                    $data[$key]['sum_bill_amount'] = $sale_item->sum('bill_amount');
//                    $data[$key]['sum_paid_amount'] = !is_null($sum_paid_amount) ? $sum_paid_amount : 0;
//                    $data[$key]['sum_balance_amount'] = $data[$key]['sum_bill_amount'] - $sum_paid_amount;
//                }

                return ['success' => true, 'sales' => $data];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Fill the Form'];
        }
    }

    public function actionGetmakepayment() {
        $post = Yii::$app->getRequest()->post();
        $model = PhaSaleBilling::find()->active()->joinWith(['sale']);
        $model->andWhere(["pha_sale.payment_type" => 'CR']);
        $model->andWhere("pha_sale_billing.paid_date between '{$post['from']}' AND '{$post['to']}'");

        if (isset($post['tenant_id'])) {
            $tenant_ids = join("','", $post['tenant_id']);
            $model->andWhere("pha_sale_billing.tenant_id IN ( '$tenant_ids' )");
        }
        if (isset($post['patient_group_name'])) {
            $patient_group_names = join("','", $post['patient_group_name']);
            $model->andWhere("pha_sale.patient_group_name IN ( '$patient_group_names' )");
        }
        if (isset($post['payment_mode'])) {
            $payment_mode = join("','", $post['payment_mode']);
            $model->andWhere("pha_sale_billing.payment_mode IN ( '$payment_mode' )");
        }

        $reports = $model->all();
        return ['report' => $reports];
    }

    public function actionConcessionpayment() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post['bill_details'])) {
            foreach ($post['bill_details'] as $bill_details) {
                $model = new PhaSaleBilling;
                $model->sale_id = $bill_details['sale_id'];
                $model->paid_date = date('Y-m-d');
                $model->paid_amount = $bill_details['concession_amount'];
                $model->settlement = 'C';
                $model->save(false);
            }
            return ['success' => true];
        } else {
            return ['success' => false];
        }
    }

    public function actionOverallincome() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $sale = PhaSaleBilling::find()
                    ->andWhere("paid_date between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere(['tenant_id' => $post['tenant_id']])
                    ->all();
            $ip_income = \common\models\PatBillingPayment::find()
                    ->active()
                    ->andWhere("payment_date between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere(['tenant_id' => $post['tenant_id']])
                    ->all();
            $op_income = \common\models\PatConsultant::find()
                    ->active()
                    ->joinWith(['encounter'])
                    ->andWhere(["pat_encounter.encounter_type" => 'OP'])
                    ->andWhere("consult_date between '{$post['from']}' AND '{$post['to']}'")
                    ->andWhere(['pat_consultant.tenant_id' => $post['tenant_id']])
                    ->all();
            return ['sale' => $sale, 'ip_income' => $ip_income,'op_income'=> $op_income,'success' => true];
        } else {
            return ['success' => false];
        }
    }

}
