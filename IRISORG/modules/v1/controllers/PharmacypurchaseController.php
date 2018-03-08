<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaPackageUnit;
use common\models\PhaPurchase;
use common\models\PhaPurchaseItem;
use common\models\PhaReorderHistory;
use common\models\PhaReorderHistoryItem;
use common\models\PhaSupplier;
use common\models\PhaPurchaseReturn;
use common\models\PhaPurchaseReturnItem;
use common\models\PhaSaleItem;
use common\models\CoAuditLog;
use PDO;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacypurchaseController extends ActiveController {

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
            $model = PhaPurchase::find()->where(['purchase_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionGetpurchases() {
        $GET = Yii::$app->getRequest()->get();

        if (isset($GET['payment_type'])) {
            $limit = isset($GET['l']) ? $GET['l'] : 5;
            $page = isset($GET['p']) ? $GET['p'] : 1;
            $condition['payment_type'] = $GET['payment_type'];

            if (isset($GET['dt'])) {
                $condition['invoice_date'] = $GET['dt'];
            }
            $data = PhaPurchase::find()->tenant()->active()->andWhere($condition);
            if (isset($GET['s']) && !empty($GET['s'])) {
                $text = $GET['s'];
                $data->joinWith(['supplier', 'phaPurchaseItems.product', 'phaPurchaseItems.batch'])
                        ->andFilterWhere([
                            'or',
                                ['like', 'pha_product.product_name', $text],
                                ['like', 'pha_product_batch.batch_no', $text],
                                ['like', 'pha_supplier.supplier_name', $text],
                                ['like', 'invoice_no', $text],
                                ['like', 'gr_num', $text],
                ]);
            }

            $offset = abs($page - 1) * $limit;
            $result = $data->orderBy(['created_at' => SORT_DESC])
                    ->limit($limit)
                    ->groupBy('pha_purchase.purchase_id')
                    ->offset($offset)
                    ->all();


            return ['success' => true, 'purchases' => $result];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetpurchase() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['purchase_id'])) {
            $data = PhaPurchase::find()
                    ->tenant()
                    ->active()
                    ->andWhere(['purchase_id' => $get['purchase_id']])
                    ->orderBy(['created_at' => SORT_DESC])
                    ->one();
            return ['success' => true, 'purchase' => $data];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetpurchasebillno() {
        $get = Yii::$app->getRequest()->get();
        $text = $get['bill_no'];

        $sales = PhaPurchase::find()
                ->tenant()
                ->active()
                ->andFilterWhere([
                    'or',
                        ['like', 'invoice_no', $text],
                ])
                ->orderBy(['invoice_no' => SORT_ASC])
                ->limit(100)
                ->all();

        return $sales;
    }

    public function actionSavepurchase() {
        $post = Yii::$app->getRequest()->post();
        return $this->_save_purchase($post);
    }

    private function _save_purchase($post, $process = 'default') {
        if (!empty($post)) {
            //Validation
            $model = new PhaPurchase;
            if (isset($post['purchase_id'])) {
                $purchase = PhaPurchase::find()->tenant()->andWhere(['purchase_id' => $post['purchase_id']])->one();
                if (!empty($purchase))
                    $model = $purchase;
            }

            $model->attributes = $post;
            $valid = $model->validate();

            foreach ($post['product_items'] as $key => $product_item) {
                $item_model = new PhaPurchaseItem();
                $item_model->scenario = 'saveform';
                $item_model->attributes = $product_item;
                $valid = $item_model->validate() && $valid;
                if (!$valid)
                    break;
            }
            //End

            if ($valid) {
                $model->save(false);

                $item_ids = [];
                foreach ($post['product_items'] as $key => $product_item) {
                    $item_model = new PhaPurchaseItem();

                    //Edit Mode
                    if (isset($product_item['purchase_item_id'])) {
                        $item = PhaPurchaseItem::find()->tenant()->andWhere(['purchase_item_id' => $product_item['purchase_item_id']])->one();
                        if (!empty($item))
                            $item_model = $item;
                    }

                    $item_model->attributes = $product_item;
                    $item_model->purchase_id = $model->purchase_id;
                    $item_model->save(false);
                    $item_ids[$item_model->purchase_item_id] = $item_model->purchase_item_id;
                }

                //Delete Product Items
                if (!empty($item_ids)) {
                    $delete_ids = array_diff($model->getProductItemIds(), $item_ids);

                    foreach ($delete_ids as $delete_id) {
                        $item = PhaPurchaseItem::find()->tenant()->andWhere(['purchase_item_id' => $delete_id])->one();
                        $item->remove();
                        PhaPurchaseItem::Updatebatchqty($item);
                        $activity = 'Purchase Item Deleted Successfully (#' . $model->invoice_no . ' )';
                        CoAuditLog::insertAuditLog(PhaPurchaseItem::tableName(), $delete_id, $activity);
                    }
                }

                //Update Reorder
                if (isset($post['reorder_id'])) {
                    PhaReorderHistory::updateAll(['status' => '0'], ['reorder_id' => $post['reorder_id']]);
                    PhaReorderHistoryItem::updateAll(['status' => '0'], ['reorder_id' => $post['reorder_id']]);
                }

                return ['success' => true, 'invoice_no' => $model->invoice_no, 'purchaseId' => $model->purchase_id];
            } else {
                if ($process == 'import') {
                    $err_summary = json_encode(array_merge($model->errors, $item_model->errors));
                } else {
                    $err_summary = Html::errorSummary([$model, $item_model]);
                }
                return ['success' => false, 'message' => $err_summary];
            }
        } else {
            return ['success' => false, 'message' => 'Fill the Form'];
        }
    }

    public function actionImport() {
        $get = Yii::$app->getRequest()->get();
        $allowed = array('csv');
        $filename = $_FILES['file']['name'];
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!in_array($ext, $allowed)) {
            return ['success' => false, 'message' => 'Unsupported File Format. CSV Files only accepted'];
        }

        $fileName = 'import_csv';
        $uploadPath = 'uploads/';
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }
        $uploadFile = $uploadPath . $fileName;
        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
            $file = Url::to($uploadFile);
            $result = $this->import($file, $get['tenant_id'], $get['import_log']);
            return ['success' => true, 'message' => $result];
        } else {
            return ['success' => false, 'message' => 'Failed to import. Try again later'];
        }
    }

    public function actionGetimporterrorlog() {
        $get = Yii::$app->getRequest()->get();
        $connection = Yii::$app->client;
        $connection->open();
        $command = $connection->createCommand("SELECT * FROM test_purchase_import WHERE tenant_id = {$get['tenant_id']} AND status = '0' AND import_log = {$get['import_log']}");
        $result = $command->queryAll(PDO::FETCH_OBJ);
        return ['success' => true, 'result' => $result];
    }

    public function actionImportstart() {
        $post = Yii::$app->getRequest()->post();
        $id = $post['id'];
        $import_log = $post['import_log'];
        $max_id = $post['max_id'];

        if ($id <= $max_id) {
            $next_id = $id + 1;
            $connection = Yii::$app->client;
            $connection->open();
            $command = $connection->createCommand("SELECT * FROM test_purchase_import WHERE id = {$id} AND import_log = $import_log");
            $result = $command->queryAll(PDO::FETCH_OBJ);

            if ($result) {
                $result = $result[0];

                $post_data = [];
                $post_data['formtype'] = 'add';
                $post_data['tenant_id'] = $result->tenant_id;
                $post_data['invoice_date'] = $result->invoice_date;
                $post_data['invoice_no'] = $result->invoice_no;
                $post_data['payment_type'] = $result->payment_type;
                $post_data['import_log'] = $result->import_log;
                $post_data['total_item_purchase_amount'] = $post_data['total_item_vat_amount'] = $post_data['total_item_discount_amount'] = 0;
                $post_data['before_disc_amount'] = $post_data['after_disc_amount'] = $post_data['total_item_purchase_amount'] = 0;

                $lineitems = json_decode($result->lineitems);

                $failed_products = $failed_packages = [];
                if ($lineitems) {
                    foreach ($lineitems as $key => $lineitem) {
                        if ($lineitem->product_id) {
                            //Search Product exists
                            $command = $connection->createCommand("SELECT product_id, product_name, b.vat,
                                                        MATCH(product_name) AGAINST ('{$lineitem->product_id}*' IN BOOLEAN MODE) AS score
                                                        FROM pha_product
                                                        JOIN pha_vat b
                                                        ON b.vat_id = purchase_vat_id
                                                        WHERE MATCH(product_name) AGAINST ('{$lineitem->product_id}*' IN BOOLEAN MODE)
                                                        AND pha_product.tenant_id = {$post_data['tenant_id']}
                                                        ORDER BY score DESC
                                                        LIMIT 1");
                            $product_result = $command->queryAll(PDO::FETCH_OBJ);
                        } else {
                            $product_result = false;
                        }

                        //Search Package exists
                        $package = PhaPackageUnit::find()->tenant($post_data['tenant_id'])->andWhere(['package_name' => $lineitem->package_name])->one();

                        if ($product_result && $package) {
                            $product_result = $product_result[0];
                            $post_data['product_items'][$key]['product_id'] = $product_result->product_id;
                            $post_data['product_items'][$key]['batch_no'] = $lineitem->batch_id;
                            $post_data['product_items'][$key]['batch_id'] = $lineitem->batch_id;
                            $post_data['product_items'][$key]['quantity'] = $lineitem->quantity;
                            $post_data['product_items'][$key]['free_quantity'] = $lineitem->free_quantity;
                            $post_data['product_items'][$key]['expiry_date'] = $lineitem->expiry_date;

                            $post_data['product_items'][$key]['package_name'] = $package->package_name;
                            $post_data['product_items'][$key]['free_quantity_unit'] = $package->package_name;

                            $post_data['product_items'][$key]['package_unit'] = $package->package_unit;
                            $post_data['product_items'][$key]['free_quantity_package_unit'] = $package->package_unit;

                            $post_data['product_items'][$key]['mrp'] = $lineitem->mrp;
                            $post_data['product_items'][$key]['purchase_rate'] = $lineitem->purchase_rate;
                            $post_data['product_items'][$key]['discount_percent'] = $lineitem->discount_percent;
                            $post_data['product_items'][$key]['vat_percent'] = $lineitem->vat_percent;

                            $post_data['product_items'][$key]['purchase_amount'] = ($post_data['product_items'][$key]['purchase_rate'] * $post_data['product_items'][$key]['quantity']);
                            $post_data['product_items'][$key]['discount_amount'] = ($post_data['product_items'][$key]['purchase_amount'] * ($post_data['product_items'][$key]['discount_percent'] / 100));
                            $post_data['product_items'][$key]['total_amount'] = $post_data['product_items'][$key]['purchase_amount'] - $post_data['product_items'][$key]['discount_amount'];
                            $post_data['product_items'][$key]['vat_percent'] = $post_data['product_items'][$key]['vat_percent'];
                            $post_data['product_items'][$key]['vat_amount'] = ($post_data['product_items'][$key]['total_amount'] * ($post_data['product_items'][$key]['vat_percent'] / 100)); // Excluding vat $lineitem->batch_id;

                            $post_data['total_item_purchase_amount'] += $post_data['product_items'][$key]['purchase_amount'] - $post_data['product_items'][$key]['discount_amount'];
                            $post_data['total_item_vat_amount'] += $post_data['product_items'][$key]['vat_amount'];
                            $post_data['total_item_discount_amount'] += $post_data['product_items'][$key]['discount_amount'];
                        } else {
                            if (!$product_result)
                                $failed_products[] = $lineitem->product_id;
                            if (!$package)
                                $failed_packages[] = $lineitem->package_name;
                        }
                    }

                    $post_data['before_disc_amount'] = ($post_data['total_item_purchase_amount'] + $post_data['total_item_vat_amount']);
                    $post_data['after_disc_amount'] = $post_data['before_disc_amount'];
                    $post_data['net_amount'] = round($post_data['after_disc_amount']);
                    $post_data['roundoff_amount'] = bcadd(abs($post_data['net_amount'] - $post_data['after_disc_amount']), 0, 2);

                    if (isset($post_data['product_items'])) {
                        if (count($lineitems) == count($post_data['product_items'])) {
                            $post_data['supplier_id'] = PhaSupplier::getSupplierid($result->supplier_id, $post_data['tenant_id']);
                            $res = $this->_save_purchase($post_data, 'import');

                            if ($res['success']) {
                                $return = ['success' => true, 'continue' => $next_id, 'message' => 'success'];
                            } else {
                                $return = ['success' => false, 'continue' => $next_id, 'message' => $res['message']];
                            }
                        }
                    }

                    if ($failed_products || $failed_packages) {
                        $message = $failed_products ? "Products not exists: " . implode(',', $failed_products) : ' ';
                        $message .= $failed_packages ? "Packages not exists: " . implode(',', $failed_packages) : '';
                        $return = ['success' => false, 'continue' => $next_id, 'message' => $message];
                    }
                } else {
                    $return = ['success' => false, 'continue' => $next_id, 'message' => 'Import data not found'];
                }
            } else {
                $return = ['success' => false, 'continue' => $next_id, 'message' => 'Import data not found'];
            }
        } else {
            $return = ['success' => false, 'continue' => 0];
        }

        if ($return['continue']) {
            $status = $return['success'] ? 1 : 0;
            $message = $return['message'];
//            $message = str_replace('<p>Please fix the following errors:</p>', '', $return['message']);
            $sql = "UPDATE test_purchase_import SET `status` = '{$status}', response = '{$message}' WHERE id={$id}";
            $command = $connection->createCommand($sql);
            $command->execute();
            $connection->close();
        }
        return $return;
    }

    public function import($filename, $tenant_id, $import_log) {
        // open the file
        $handle = fopen($filename, "r");
        // read the 1st row as headings
        $header = fgetcsv($handle);

//        if (trim($header[0]) != 'Employee Code' || trim($header[1]) != 'Employee Name' || trim($header[2]) != 'InTime' || trim($header[3]) != 'OutTime' || trim($header[4]) != 'PunchRecords') {
//        }
        // read each data row in the file
        $import = [];
        $connection = Yii::$app->client;
        $connection->open();
//        $sql = "truncate table test_purchase_import";
//        $command = $connection->createCommand($sql);
//        $command->execute();

        while (($row = fgetcsv($handle)) !== FALSE) {
            $invoice_no = $row[1];
            if ($invoice_no) {
                $invoice_date = date('Y-m-d', strtotime(str_replace('/', '-', $row[2])));
                $payment_type = $row[3] == 'CREDIT' ? 'CR' : 'CA';
                $supplier_name = $row[4];
                $product_name = $this->clean(str_replace('-', ' ', $row[5]));
                $pkg_unit = $this->clean($row[6]);
                $batch = $row[7];
                $expiry_date = date('Y-m-d', strtotime(str_replace('/', '/1/', $row[8])));
                $mrp = $row[9];
                $purchase_price = $row[14];
                $qty = $row[11];
                $free = $row[13];
                $free_unit = $pkg_unit;
                $disc_perc = $row[16];
                $vat_perc = $row[17];

                //Here we going to insert the purchase
                if (isset($last_invoice) && $last_invoice != $invoice_no) {
                    $lineitems = json_encode($import[$last_invoice]['lineitems']);
                    $sql = "INSERT INTO test_purchase_import(tenant_id, invoice_no, invoice_date, payment_type, supplier_id, lineitems, import_log) VALUES({$import[$last_invoice]['tenant_id']},'{$import[$last_invoice]['invoice_no']}', '{$import[$last_invoice]['invoice_date']}', '{$import[$last_invoice]['payment_type']}', " . '"' . $import[$last_invoice]['supplier_id'] . '"' . ",'{$lineitems}', '{$import[$last_invoice]['import_log']}')";
                    $command = $connection->createCommand($sql);
                    $command->execute();
                    unset($import[$last_invoice]);
                    $import = [];
                }

                if (!isset($import[$invoice_no])) {
                    $import[$invoice_no]['tenant_id'] = $tenant_id;
                    $import[$invoice_no]['invoice_no'] = $invoice_no;
                    $import[$invoice_no]['invoice_date'] = $invoice_date;
                    $import[$invoice_no]['payment_type'] = $payment_type;
                    $import[$invoice_no]['supplier_id'] = $supplier_name;
                    $import[$invoice_no]['import_log'] = $import_log;
                }
                $import[$invoice_no]['lineitems'][] = [
                    'product_id' => $product_name,
                    'expiry_date' => $expiry_date,
                    'batch_id' => $batch,
                    'quantity' => $qty,
                    'package_name' => $pkg_unit,
                    'free_quantity' => $free,
                    'free_quantity_unit' => $free_unit,
                    'mrp' => $mrp,
                    'purchase_rate' => $purchase_price,
                    'discount_percent' => $disc_perc,
                    'vat_percent' => $vat_perc,
                ];

                $last_invoice = $invoice_no;
            }
        }
        //Here we going to insert the last purchase row
        if (isset($import[$last_invoice])) {
            $lineitems = json_encode($import[$last_invoice]['lineitems']);
            $sql = "INSERT INTO test_purchase_import(tenant_id, invoice_no, invoice_date, payment_type, supplier_id, lineitems, import_log) VALUES({$import[$last_invoice]['tenant_id']},'{$import[$last_invoice]['invoice_no']}', '{$import[$last_invoice]['invoice_date']}', '{$import[$last_invoice]['payment_type']}', " . '"' . $import[$last_invoice]['supplier_id'] . '"' . ",'{$lineitems}', '{$import[$last_invoice]['import_log']}')";
            $command = $connection->createCommand($sql);
            $command->execute();
            unset($import[$last_invoice]);
            $import = [];
        }

        // close the file
        fclose($handle);
        // return the messages
        @unlink($filename);

        $command = $connection->createCommand("SELECT COUNT(*) AS 'total_rows', (SELECT MIN(id) FROM test_purchase_import WHERE import_log = $import_log) AS id,
                                            (SELECT MAX(id) FROM test_purchase_import WHERE import_log = $import_log) AS max_id
                                            FROM test_purchase_import WHERE import_log = $import_log");
        $result = $command->queryAll(PDO::FETCH_OBJ);
        $connection->close();
        return $result[0];
    }

    public function clean($string) {
        return preg_replace("/[^ \w]+/", '', $string); // Removes special chars.
    }

    public function actionCheckdelete() {
        $get = Yii::$app->getRequest()->post();
        $return = PhaPurchaseReturn::find()->tenant()->andWhere(['purchase_id' => $get['id']])->one();
        if (empty($return)) {
            $purchase_delete = true;
            $model = PhaPurchase::find()->tenant()->andWhere(['purchase_id' => $get['id']])->one();
            foreach ($model->phaPurchaseItems as $purchase) {
                $batchAvailableQuantity = $purchase->batch->available_qty;
                $purchaseQuantity = ($purchase->quantity * $purchase->package_unit) + ($purchase->free_quantity * $purchase->free_quantity_package_unit);

                if ($purchaseQuantity > $batchAvailableQuantity) {
                    $purchase_notdelete_item = $purchase->purchase_item_id;
                    $purchase_delete = false;
                }
                if(!$purchase_delete) break;
                
            }
            if ($purchase_delete) {
                foreach ($model->phaPurchaseItems as $purchase) {
                    $purchase->remove();
                    PhaPurchaseItem::Updatebatchqty($purchase);
                }
                $model->remove();
                $activity = 'Purchase Deleted Successfully (#' . $model->invoice_no . ' )';
                CoAuditLog::insertAuditLog(PhaPurchase::tableName(), $get['id'], $activity);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => "Sorry, you can't delete this purchase", 'not_deleted_item' => $purchase_notdelete_item];
            }
        } else {
            return ['success' => false, 'message' => "Sorry, you can't delete this purchase"];
        }
    }

    public function actionCheckitemdelete() {
        $get = Yii::$app->getRequest()->post();
        $purchaseItem = PhaPurchaseReturnItem::find()->tenant()->andWhere(['purchase_item_id' => $get['id']])->one();

        if (empty($purchaseItem)) {
            $model = PhaPurchaseItem::find()->tenant()->andWhere(['purchase_item_id' => $get['id']])->one();
            $batchAvailableQuantity = $model->batch->available_qty;
            $purchaseQuantity = ($model->quantity * $model->package_unit) + ($model->free_quantity * $model->free_quantity_package_unit);

            if ($purchaseQuantity > $batchAvailableQuantity) {
                return ['success' => false, 'message' => "Sorry, you can't delete this purchase item, Because this purchase item already returned"];
            } else
                return ['success' => true];
        } else {
            return ['success' => false, 'message' => "Sorry, you can't delete this purchase item, Because no available quantity in stock"];
        }
    }

}
