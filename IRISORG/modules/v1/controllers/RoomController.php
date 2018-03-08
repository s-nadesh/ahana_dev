<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRoom;
use common\models\CoRoomType;
use common\models\CoRoomTypesRooms;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Expression;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class RoomController extends ActiveController {

    public $modelClass = 'common\models\CoRoom';

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

    public function actionGetrooms() {
//        $model = CoRoom::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC])->all();
//        $data = [];
//        foreach ($model as $key => $value) {
//            $data[$key] = $value->attributes;
//            $data[$key]['roomTypes'] = $value->roomTypes;
//        }
//        return $data;

        $requestData = $_REQUEST;

        $modelClass = $this->modelClass;
        $totalData = $modelClass::find()->tenant()->active()->count();
        $totalFiltered = $totalData;
        
        // Order Records
        if (isset($requestData['order'])) {
            if ($requestData['order'][0]['dir'] == 'asc') {
                //$sort_dir = SORT_ASC ;
                $order_array = '(bed_name+0) ASC';      //bed_name field is varchar its convert to interger field - columname + '0' 
            } elseif ($requestData['order'][0]['dir'] == 'desc') {
                //$sort_dir = SORT_DESC;
                $order_array = '(bed_name+0) DESC';     //bed_name field is varchar its convert to interger field - columname + '0'
            }
            //$order_array = [$requestData['columns'][$requestData['order'][0]['column']]['data'] => $sort_dir];
            //$order_array = '(bed_name+0)';
        }

        if (!empty($requestData['search']['value'])) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $totalFiltered = $modelClass::find()->tenant()->active()
                    ->joinWith(['roomTypes'])
                    ->andFilterWhere([
                        'OR',
                        ['like', 'co_room.bed_name', $requestData['search']['value']],
                        ['like', 'co_room_type.room_type_name', $requestData['search']['value']],
                    ])
                    ->count();

            $rooms = $modelClass::find()->tenant()->active()
                    ->joinWith(['roomTypes'])
                    ->andFilterWhere([
                        'OR',
                        ['like', 'co_room.bed_name', $requestData['search']['value']],
                        ['like', 'co_room_type.room_type_name', $requestData['search']['value']],
                    ])
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        } else {
            $rooms = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($rooms as $room) {
            $nestedData = array();
            $nestedData['room_id'] = $room->room_id;
            $nestedData['bed_name'] = $room->bed_name;
            $nestedData['room_type_name'] = \yii\helpers\ArrayHelper::map($room->roomTypes, 'room_type_id', 'room_type_name');
            $data[] = $nestedData;
        }

        return array(
            "draw" => intval($requestData['draw']),
            "recordsTotal" => intval($totalData),
            "recordsFiltered" => intval($totalFiltered),
            "data" => $data   // total data array
        );
    }

    //room_types_rooms.js
    public function actionGetroomandroomtypes() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $room = CoRoom::find()->tenant()->andWhere(['room_id' => $id])->one();
            $room_types = $room->roomTypesRooms;
            return ['success' => true, 'room' => $room, 'room_types' => $room_types];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    //room_types_rooms.js
    public function actionAssignroomtypes() {
        $post = Yii::$app->request->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (!empty($post) && !empty($tenant_id)) {
            $model = new CoRoomTypesRooms;
            $model->tenant_id = $tenant_id;
            $model->scenario = 'roomtypesassign';
            $model->attributes = $post;

            if ($model->validate()) {
                $room = CoRoom::find()->where(['room_id' => $post['room_id']])->one();

                foreach ($post['room_type_ids'] as $room_type_id) {
                    $room_types[] = CoRoomType::find()->where(['room_type_id' => $room_type_id])->one();
                }

                $extraColumns = ['tenant_id' => $tenant_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()')]; // extra columns to be saved to the many to many table
                $unlink = true; // unlink tags not in the list
                $delete = true; // delete unlinked tags
                $room->linkAll('roomTypes', $room_types, $extraColumns, $unlink, $delete);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetroomlist() {
        $tenant = null;
        $status = '1';
        $deleted = false;

        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['occupied_status']))
            $occupied_status = $get['occupied_status'];

        return ['roomList' => CoRoom::getRoomList($tenant, $status, $deleted, $occupied_status)];
    }

}
