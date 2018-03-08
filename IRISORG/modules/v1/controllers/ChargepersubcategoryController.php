<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoChargePerSubcategory;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * SpecialityController implements the CRUD actions for CoTenant model.
 */
class ChargepersubcategoryController extends ActiveController {

    public $modelClass = 'common\models\CoChargePerSubcategory';

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
            'query' => $modelClass::find()->active(),
            'pagination' => false,
        ]);
    }

    public function actionGetchargepersubcategorylist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['cat_id']))
            $cat_id = $get['cat_id'];

        return ['subcategoryList' => CoChargePerSubcategory::getChargePerSubCateogrylist($deleted, $cat_id)];
    }

    public function actionGetcustomlist() {
        $lists = CoChargePerSubcategory::find()->orderBy(['charge_type' => SORT_ASC, 'charge_id' => SORT_ASC])->all();
        $ret = [];
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        foreach ($lists as $key => $list) {
            if($list->charge->tenant_id == $tenant_id)
                $ret[$list->charge_type][$list->charge->charge_cat_type][$list->charge->charge_code_id][$list->charge_link_id] = array('id' => $list->sub_charge_id, 'amount' => $list->charge_amount);
        }
        return $ret;
    }

    public function actionSaveallchargecategory() {
        $post = Yii::$app->getRequest()->post();
        
        $valid = true;
        foreach ($post['subcategories'] as $attr) {
            $model = new CoChargePerSubcategory();
            $model->attributes = $attr;
            $valid = $model->save() && $valid;
        }
        return ['success' => $valid]; 
    }
}
