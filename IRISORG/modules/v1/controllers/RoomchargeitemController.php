<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoomChargeItem;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * RoomChargeItemController implements the CRUD actions for CoTenant model.
 */
class RoomchargeitemController extends ActiveController {

    public $modelClass = 'common\models\CoRoomChargeItem';

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
        if($id){
            $model = CoRoomChargeItem::find()->where(['charge_item_id' => $id])->one();
            $model->remove();
            $activity = 'Room Charge Item Deleted Successfully (#' . $model->charge_item_name . ' )';
            CoAuditLog::insertAuditLog(CoRoomChargeItem::tableName(), $id, $activity);
            return ['success' => true];
        }
    }
    
    public function actionGetroomchargeitemlist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['chargeitemList' => CoRoomChargeItem::getRoomChargeItemlist($tenant, $status, $deleted)];
    }
}
