<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoomChargeSubcategory;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * RoomChargeCategoryController implements the CRUD actions for CoTenant model.
 */
class RoomchargesubcategoryController extends ActiveController {

    public $modelClass = 'common\models\CoRoomChargeSubcategory';

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
            $model = CoRoomChargeSubcategory::find()->where(['charge_subcat_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionGetroomchargesubcategorylist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['cat_id']))
            $cat_id = $get['cat_id'];

        return ['subcategoryList' => CoRoomChargeSubcategory::getRoomChargeSubCateogrylist($tenant, $status, $deleted, $cat_id)];
    }

    public function actionGetcustomlist() {
        $lists = CoRoomChargeSubcategory::find()->tenant()->active()->orderBy(['charge_subcat_name' => SORT_ASC])->all();
        $ret = [];
        foreach ($lists as $key => $list) {
            $ret[$list->charge_cat_id][$list->charge_subcat_id] = array('id' => $list->charge_subcat_id, 'name' => $list->charge_subcat_name);
        }
        return $ret;
    }

    public function actionSaveallsubcategory() {
        $post = Yii::$app->getRequest()->post();

        $valid = true;
        foreach ($post['subcategories'] as $subcat) {
            $model = CoRoomChargeSubcategory::find()->where(['charge_subcat_id' => $subcat['charge_subcat_id']])->one();

            if (empty($model)) {
                $model = new CoRoomChargeSubcategory;
                $model->charge_cat_id = $post['charge_cat_id'];
            }
            $model->charge_subcat_name = $subcat['charge_subcat_name'];
            $valid = $model->save() && $valid;
        }
        return ['success' => $valid];
    }

    public function actionDeleteallsubcategory() {
        $post = Yii::$app->getRequest()->post();

        $valid = true;
        foreach ($post['subcategories'] as $subcat_id) {
            $model = CoRoomChargeSubcategory::find()->where(['charge_subcat_id' => $subcat_id])->one();
            $valid = $model->delete() && $valid;
        }
        return ['success' => $valid];
    }

    public function actionGetcategory() {
        $subCategory = CoRoomChargeSubcategory::find()->tenant()->all();
        return ['subCategory' => $subCategory];
    }

}
