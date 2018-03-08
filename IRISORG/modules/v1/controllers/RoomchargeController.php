<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoomCharge;
use common\models\CoAuditLog;
use common\models\CoRoomChargeItem;
use common\models\CoRoomType;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * RoomChargeController implements the CRUD actions for CoTenant model.
 */
class RoomchargeController extends ActiveController {

    public $modelClass = 'common\models\CoRoomCharge';

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
            $model = CoRoomCharge::find()->where(['charge_id' => $id])->one();
            $model->remove();
            $charge = CoRoomChargeItem::find()->where(['charge_item_id' => $model->charge_item_id])->one();
            $type = CoRoomType::find()->where(['room_type_id' => $model->room_type_id])->one();
            $activity = "Room Charges Deleted Successfully (#$charge->charge_item_name,$type->room_type_name,$model->charge)";
            CoAuditLog::insertAuditLog(CoRoomCharge::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
