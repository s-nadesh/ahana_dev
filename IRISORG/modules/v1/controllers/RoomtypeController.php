<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoomType;
use common\models\CoRoomTypesRooms;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * RoomtypeController implements the CRUD actions for CoTenant model.
 */
class RoomtypeController extends ActiveController {

    public $modelClass = 'common\models\CoRoomType';

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

    protected function excludeColumns($attrs) {
        $exclude_cols = ['created_by', 'created_at', 'modified_by', 'modified_at'];
        foreach ($attrs as $col => $val) {
            if (in_array($col, $exclude_cols))
                unset($attrs[$col]);
        }
        return $attrs;
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = CoRoomType::find()->where(['room_type_id' => $id])->one();
            $model->remove();
            $activity = 'Bed Type Deleted Successfully (#' . $model->room_type_name . ' )';
            CoAuditLog::insertAuditLog(CoRoomType::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionGetroomtypelist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['roomtypeList' => CoRoomType::getRoomTypelist($tenant, $status, $deleted)];
    }

    public function actionGetroomtypesroomslist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        return ['roomtypesroomsList' => CoRoomTypesRooms::getRoomTypesRoomslist($tenant)];
    }

}
