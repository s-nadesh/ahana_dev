<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoomChargeCategory;
use common\models\CoAuditLog;
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
class RoomchargecategoryController extends ActiveController {

    public $modelClass = 'common\models\CoRoomChargeCategory';

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
            'query' => $modelClass::find()->tenantWithNull()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionGetroomchargelist() {
        // exceptCode() -> use this function to hide Allied & Procedures in listing.
        return ['list' => CoRoomChargeCategory::find()->tenantWithNull()->active()->orderBy(['created_at' => SORT_DESC])->all()];
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = CoRoomChargeCategory::find()->where(['charge_cat_id' => $id])->one();
            $model->remove();
            $activity = 'Room Charge Category Deleted Successfully (#' . $model->charge_cat_name . ' )';
            CoAuditLog::insertAuditLog(CoRoomChargeCategory::tableName(), $id, $activity);
            foreach ($model->roomchargesubcategory as $sub) {
                $sub->remove();
            }
            return ['success' => true];
        }
    }

    public function actionGetroomchargecategorylist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['categoryList' => CoRoomChargeCategory::getRoomChargeCateogrylist($tenant, $status, $deleted)];
    }

    public function actionGetchargelist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['code']))
            $code = $get['code'];

        $category = CoRoomChargeCategory::find()->where(['charge_cat_code' => $code])->one();

        return ['categoryList' => CoRoomChargeCategory::getChargeListByCode($tenant, $status, $deleted, $code), 'category' => $category];
    }

    public function actionGetcategory() {
        $category = CoRoomChargeCategory::find()->tenant()->orWhere(['charge_cat_code'=>'ALC'])->all();
        foreach ($category as $value) {
            $list[] = array('value' => $value['charge_cat_id'], 'label' => $value['charge_cat_name']);
        }
        return ['category' => $list];
    }

}
