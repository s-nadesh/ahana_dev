<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaProductBatch;
use common\models\PhaPurchase;
use common\models\PhaSale;
use common\models\PhaSaleReturn;
use common\models\PhaPurchaseItem;
use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacyreportController extends ActiveController {

    public $modelClass = 'common\models\PhaPurchase';

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

    public function actionPurchasereport() {
        $post = Yii::$app->getRequest()->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        $model = PhaPurchase::find()
                ->tenant()
                ->andWhere("pha_purchase.invoice_date between '{$post['from']}' AND '{$post['to']}'");
        if (isset($post['payment_type'])) {
            $model->andWhere(['pha_purchase.payment_type' => $post['payment_type']]);
        }
        $reports = $model->all();

        return ['report' => $reports];
    }

    public function actionNewpurchasereport() {
        $post = Yii::$app->getRequest()->post();

        $model = PhaPurchaseItem::find()
                ->tenant()
                ->joinWith(['purchase'])
                ->andWhere("pha_purchase.invoice_date between '{$post['from']}' AND '{$post['to']}'");
        if (isset($post['payment_type'])) {
            $model->andWhere(['pha_purchase.payment_type' => $post['payment_type']]);
        }
        $reports = $model->all();

        return ['report' => $reports];
    }

    //Sale Report
    public function actionSalereport() {
        $post = Yii::$app->getRequest()->post();

        $model = PhaSale::find()
                ->tenant()
                ->andWhere("pha_sale.sale_date between '{$post['from']}' AND '{$post['to']}'");

        if (isset($post['payment_type'])) {
            $model->andWhere(['pha_sale.payment_type' => $post['payment_type']]);
        }
        if (isset($post['patient_group_name'])) {
            $patient_group_names = join("','", $post['patient_group_name']);
            $model->andWhere("pha_sale.patient_group_name IN ( '$patient_group_names' )");
        }

        $reports = $model->all();

        return ['report' => $reports];
    }

    //Sale Vat Report
    public function actionSalevatreport() {
        $dbname = Yii::$app->client->createCommand("SELECT DATABASE()")->queryScalar();
        $post = Yii::$app->getRequest()->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $current_database = Yii::$app->db->createCommand("SELECT DATABASE()")->queryScalar();
        $sql = "SELECT
                    a.sale_id,a.bill_no,a.sale_date,
                    d.patient_global_int_code, a.patient_name,
                    (cgst_percent+sgst_percent) AS tax_rate,
                    SUM(b.taxable_value) AS taxable_value,  
                    SUM(b.cgst_amount) AS cgst_amount,
                    SUM(b.sgst_amount) AS sgst_amount,
                    a.roundoff_amount
                FROM `pha_sale` `a`
                    LEFT JOIN `pha_sale_item` `b`
                    ON `a`.`sale_id` = `b`.`sale_id`
                    LEFT JOIN " . $dbname . ".pat_patient c
                    ON c.patient_id = a.patient_id
                    LEFT JOIN $current_database.gl_patient d
                    ON c.patient_global_guid = d.patient_global_guid
                    WHERE ((`a`.`tenant_id` = '" . $tenant_id . "')
                    AND (a.sale_date BETWEEN '" . $post['from'] . "' AND '" . $post['to'] . "'))
                    AND (b.deleted_at = '0000-00-00 00:00:00')
                    AND (a.deleted_at = '0000-00-00 00:00:00')
                    GROUP BY `b`.`sale_id`,`b`.`cgst_percent` ";
        //$command = Yii::$app->client->createCommand($sql);
        $command = Yii::$app->client_pharmacy->createCommand($sql);
        $reports = $command->queryAll();
        return ['report' => $reports];
    }

    //Sale Return Report
    public function actionSalereturnreport() {
        $post = Yii::$app->getRequest()->post();

        $model = PhaSaleReturn::find()
                ->tenant()
                ->joinWith('sale')
                ->andWhere("pha_sale_return.sale_return_date between '{$post['from']}' AND '{$post['to']}'");

        if (isset($post['payment_type'])) {
            $model->andWhere(['pha_sale.payment_type' => $post['payment_type']]);
        }
        if (isset($post['patient_group_name'])) {
            $patient_group_names = join("','", $post['patient_group_name']);
            $model->andWhere("pha_sale.patient_group_name IN ( '$patient_group_names' )");
        }

        $reports = $model->all();

        return ['report' => $reports];
    }

    //Prescriptionregister Report
    public function actionPrescriptionregisterreport() {
        $post = Yii::$app->getRequest()->post();

        $model = PhaSale::find()
                ->andWhere(['not', ['pha_sale.patient_id' => null]]);

        if (isset($post['from']) && isset($post['consultant_id']) && isset($post['tenant_id'])) {
            $consultant_ids = join("','", $post['consultant_id']);
            $tenant_ids = join("','", $post['tenant_id']);
            $model->andWhere(["pha_sale.sale_date" => $post['from']]);
            $model->andWhere("pha_sale.consultant_id IN ( '$consultant_ids' )");
            $model->andWhere("pha_sale.tenant_id IN ( '$tenant_ids' )");
        }

        $reports = $model->all();

        return ['report' => $reports];
    }

    public function actionGetsalegrouplist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        $saleGroups = PhaSale::find()
                ->tenant($tenant)
                ->status($status)
                ->active()
                ->andWhere("patient_group_name != ''")
                ->groupBy('patient_group_name')
                ->all();

        $saleGroupsList = [];
        if (!empty($saleGroups)) {
            $saleGroupsList = ArrayHelper::map($saleGroups, 'patient_group_name', 'patient_group_name');
        }

        return ['saleGroupsList' => $saleGroupsList];
    }

    public function actionStockasonreport() {
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $conncection = Yii::$app->client;
        $command = $conncection->createCommand("
            SELECT
                pha_product.product_name,  
                pha_product_batch.batch_no,
                pha_product_batch.available_qty, 
                pha_purchase_item.purchase_rate, 
                pha_product_batch.available_qty * pha_purchase_item.purchase_rate AS TotalRate,
                pha_purchase_item.discount_percent, 
                FORMAT((SELECT TotalRate) * (pha_purchase_item.discount_percent / 100), 2) AS disAmount,
                IFNULL(FORMAT((SELECT TotalRate) - (SELECT disAmount), 2),(SELECT TotalRate)) AS `selfValue`
            FROM `pha_product_batch`
                LEFT JOIN `pha_product`
                  ON `pha_product_batch`.`product_id` = `pha_product`.`product_id`
                LEFT JOIN `pha_purchase_item`
                  ON `pha_product_batch`.`batch_id` = `pha_purchase_item`.`batch_id`
            WHERE `pha_product_batch`.`tenant_id` = {$tenant_id}
               AND pha_purchase_item.tenant_id = {$tenant_id}
               AND pha_purchase_item.purchase_item_id =  (SELECT MAX(purchase_item_id) FROM pha_purchase_item WHERE batch_id = pha_product_batch.batch_id)
            ORDER BY `product_name` DESC
           
        ");
        $stock_report = $command->queryAll();
        return ['stock_report' => $stock_report];
    }

    public function actionStockreport() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            //$conncection = Yii::$app->client;
            $conncection = Yii::$app->client_pharmacy;
            $command = $conncection->createCommand("CALL pha_stock_report_by_date({$post['tenant_id']}, '{$post['from']}');");
            $stock_report = $command->queryAll();
            return ['stock_report' => $stock_report];
        }
    }

    //Not using now 
//    public function actionStockreport() {
//        $post = Yii::$app->getRequest()->post();
//        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
//
//        $stocks = PhaProductBatch::find()
//                ->joinWith('product')
//                ->joinWith('phaProductBatchRate')
//                ->andWhere(['pha_product.tenant_id' => $tenant_id])
//                ->addSelect([
//                    "CONCAT(
//                        IF(pha_product.product_name IS NULL OR pha_product.product_name = '', ' ', pha_product.product_name),
//                        IF(pha_product.product_unit_count IS NULL OR pha_product.product_unit_count = '', ' ', CONCAT(' | ', pha_product.product_unit_count)),
//                        IF(pha_product.product_unit IS NULL OR pha_product.product_unit = '', ' ', CONCAT(' | ', pha_product.product_unit))
//                    ) as product_name",
//                    'SUM(available_qty) as available_qty',
//                    'pha_product.product_code as product_code',
//                    'pha_product_batch_rate.mrp as mrp'])
//                ->groupBy(['pha_product.product_id'])
//                ->all();
//
//        $reports = [];
//
//        foreach ($stocks as $key => $purchase) {
//            $reports[$key]['product_name'] = $purchase['product_name'];
//            $reports[$key]['product_code'] = $purchase['product_code'];
//            $reports[$key]['mrp'] = $purchase['mrp'];
//            $reports[$key]['available_qty'] = $purchase['available_qty'];
//            $reports[$key]['stock_value'] = $purchase['mrp'] * $purchase['available_qty'];
//        }
//
//        return ['report' => $reports];
//    }
}
