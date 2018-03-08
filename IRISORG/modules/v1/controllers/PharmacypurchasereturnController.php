<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaPurchaseReturn;
use common\models\PhaPurchaseReturnItem;
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
class PharmacypurchasereturnController extends ActiveController {

    public $modelClass = 'common\models\PhaPurchaseReturn';

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
            $model = PhaPurchaseReturn::find()->where(['purchase_ret_id' => $id])->one();
            $model->remove();
            $activity = 'Purchase Return Deleted Successfully (#'. $model->invoice_no.' )';
            CoAuditLog::insertAuditLog(PhaPurchaseReturn::tableName(), $this->purchase_ret_id, $activity);
            return ['success' => true];
        }
    }

    public function actionSavepurchasereturn() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            //Validation
            $model = new PhaPurchaseReturn;
            if (isset($post['purchase_ret_id'])) {
                $purchase = PhaPurchaseReturn::find()->tenant()->andWhere(['purchase_ret_id' => $post['purchase_ret_id']])->one();
                if (!empty($purchase))
                    $model = $purchase;
            }

            $model->attributes = $post;
            $valid = $model->validate();

            foreach ($post['product_items'] as $key => $product_item) {
                if ($product_item['quantity'] > 0) {
                    $item_model = new PhaPurchaseReturnItem();
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

            if ($valid) {
                if (!empty($post['product_items'])) {
                    $model->save(false);

                    $item_ids = [];
                    foreach ($post['product_items'] as $key => $product_item) {
                        $item_model = new PhaPurchaseReturnItem();

                        //Edit Mode
                        if (isset($product_item['purchase_ret_item_id'])) {
                            $item = PhaPurchaseReturnItem::find()->tenant()->andWhere(['purchase_ret_item_id' => $product_item['purchase_ret_item_id']])->one();
                            if (!empty($item))
                                $item_model = $item;
                        }

                        $item_model->attributes = $product_item;
                        $item_model->purchase_ret_id = $model->purchase_ret_id;
                        $item_model->save(false);
                        $item_ids[$item_model->purchase_ret_item_id] = $item_model->purchase_ret_item_id;
                    }

                    //Delete Product Items
                    if (!empty($item_ids)) {
                        $delete_ids = array_diff($model->getProductItemIds(), $item_ids);

                        foreach ($delete_ids as $delete_id) {
                            $item = PhaPurchaseReturnItem::find()->tenant()->andWhere(['purchase_ret_item_id' => $delete_id])->one();
                            $item->delete();
                        }
                    }

                    return ['success' => true];
                } else {
                    return ['success' => false, 'message' => 'No Items to return'];
                }
            } else {
                if (isset($item_model)) {
                    return ['success' => false, 'message' => Html::errorSummary([$model, $item_model])];
                } else {
                    return ['success' => false, 'message' => Html::errorSummary([$model])];
                }
            }
        } else {
            return ['success' => false, 'message' => 'Fill the Form'];
        }
    }

    public function actionGetpurchasereturn() {
        $get = Yii::$app->getRequest()->get();
        $offset = abs($get['pageIndex'] - 1) * $get['pageSize'];
        $result = PhaPurchaseReturn::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC])->limit($get['pageSize'])->offset($offset)->all();
        $totalCount = PhaPurchaseReturn::find()->tenant()->active()->count();
        return ['success' => true, 'result' => $result, 'totalCount' => $totalCount];
    }

}
