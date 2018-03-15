<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaSaleReturn;
use common\models\PhaSaleReturnItem;
use common\models\PhaSaleBilling;
use common\models\PhaSale;
use common\models\PhaSaleItem;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacysalereturnController extends ActiveController {

    public $modelClass = 'common\models\PhaSaleReturn';

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
            $model = PhaSaleReturn::find()->where(['sale_ret_id' => $id])->one();
            $model->remove();
            $activity = 'Sale Return Deleted Successfully (#' . $model->bill_no . ' )';
            CoAuditLog::insertAuditLog(PhaSaleReturn::tableName(), $get['id'], $activity);
            return ['success' => true];
        }
    }

    public function actionSavesalereturn() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            //Validation
            $model = new PhaSaleReturn;
            if (isset($post['sale_ret_id'])) {
                $salereturn = PhaSaleReturn::find()->tenant()->andWhere(['sale_ret_id' => $post['sale_ret_id']])->one();
                if (!empty($salereturn))
                    $model = $salereturn;
            }

            $model->attributes = $post;
            $valid = $model->validate();

            foreach ($post['product_items'] as $key => $product_item) {
                if ($product_item['quantity'] > 0) {
                    $item_model = new PhaSaleReturnItem();
                    if (isset($product_item['sale_ret_item_id'])) {
                        $item_model = PhaSaleReturnItem::find()->tenant()->andWhere(['sale_ret_item_id' => $product_item['sale_ret_item_id']])->one();
                    }
                    $item_model->scenario = 'saveform';
                    $item_model->attributes = $product_item;
                    $valid = $item_model->validate() && $valid;
                    if (!$valid)
                        break;
                }else {
                    unset($post['product_items'][$key]);
                }
            }
            //End

            if (!$post['product_items']) {
                $model->noitem = true;
                $valid = $model->validate();
                $item_model = new PhaSaleReturnItem();
            }

            if ($valid) {
                $model->save(false);
                

                $item_ids = [];
                foreach ($post['product_items'] as $key => $product_item) {
                    $item_model = new PhaSaleReturnItem();

                    //Edit Mode
                    if (isset($product_item['sale_ret_item_id'])) {
                        $item = PhaSaleReturnItem::find()->tenant()->andWhere(['sale_ret_item_id' => $product_item['sale_ret_item_id']])->one();
                        if (!empty($item))
                            $item_model = $item;
                    }

                    $item_model->attributes = $product_item;
                    $item_model->sale_ret_id = $model->sale_ret_id;
                    $item_model->save(false);
                    $item_ids[$item_model->sale_ret_item_id] = $item_model->sale_ret_item_id;
                }

                //Delete Product Items
                if (!empty($item_ids)) {
                    $delete_ids = array_diff($model->getSaleReturnItemIds(), $item_ids);

                    foreach ($delete_ids as $delete_id) {
                        $item = PhaSaleReturnItem::find()->tenant()->andWhere(['sale_ret_item_id' => $delete_id])->one();
                        $item->delete();
                    }
                }

                //New Sale
                if (!empty($post['sale_items_bill'])) {
                    $SRmodel = new PhaSale;
                    $SRmodel->attributes = $post['sale_items_bill'];
                    $SRmodel->sale_date = date('Y-m-d');
                    $SRmodel->patient_id = $post['patient_id'];
                    $SRmodel->patient_name = $post['patient_name'];
                    $SRmodel->patient_group_name = $post['patient_group_name'];
                    $SRmodel->payment_type = 'CA';
                    $SRmodel->sale_return_id = $model->sale_ret_id;
                    $SRmodel->save(false);

                    $item_ids = [];
                    foreach ($post['sale_items'] as $key => $product_item) {
                        $SRitem_model = new PhaSaleItem();
                        $SRitem_model->attributes = $product_item;
                        $SRitem_model->sale_id = $SRmodel->sale_id;
                        $SRitem_model->save(false);
                        $item_ids[$SRitem_model->sale_item_id] = $SRitem_model->sale_item_id;
                    }
                }

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $item_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Fill the Form'];
        }
    }

    public function actionGetsalereturn() {
        $get = Yii::$app->getRequest()->get();
        $searchCondition = '';
        $condition = [];
        if ($get) {
            $offset = abs($get['pageIndex'] - 1) * $get['pageSize'];

            if (isset($get['dt'])) {
                $condition['sale_return_date'] = $get['dt'];
            }
            if (isset($get['s']) && !empty($get['s']) && $get['s'] != 'null') {
                $text = $get['s'];
                $searchCondition = [
                    'or',
                        ['like', 'patient_name', $text],
                        ['like', 'bill_no', $text],
                        ['like', 'gl_patient.patient_global_int_code', $text],
                ];
            }

            $data = PhaSaleReturn::find()->tenant()->active()
                    ->orderBy(['created_at' => SORT_DESC])
                    ->limit($get['pageSize']);
            if ($condition) {
                $data->andWhere($condition);
            }
            if ($searchCondition) {
                $data->joinWith(['patient.glPatient']);
                $data->andFilterWhere($searchCondition);
            }
            $result = $data->offset($offset)->all();

            $resultCount = PhaSaleReturn::find()->tenant()->active();
            if ($condition) {
                $resultCount->andWhere($condition);
            }
            if ($searchCondition) {
                $resultCount->joinWith(['patient.glPatient']);
                $resultCount->andFilterWhere($searchCondition);
            }
            $totalCount = $resultCount->count();

            return ['success' => true, 'result' => $result, 'totalCount' => $totalCount];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }
    
    public function actionCheckreturnsale() {
        $post = Yii::$app->getRequest()->post();
        $return = PhaSale::find()->tenant()->andWhere(['sale_return_id' => $post['id']])->one();
        if(empty($return)) {
            return ['success' => true];
        } else {
            return ['success' => false];
        }
    }

}
