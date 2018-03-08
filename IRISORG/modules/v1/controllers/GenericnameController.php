<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaGeneric;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * GenericnameController implements the CRUD actions for CoTenant model.
 */
class GenericnameController extends ActiveController {

    public $modelClass = 'common\models\PhaGeneric';

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
            $model = PhaGeneric::find()->where(['generic_id' => $id])->one();
            $model->remove();
            $activity = 'Generic Name Deleted Successfully (#' . $model->generic_name . ' )';
            CoAuditLog::insertAuditLog(PhaGeneric::tableName(), $id, $activity);
            return ['success' => true];
        }
    }
    
    public function actionGetgenericlist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['notUsed']))
            $notUsed = $get['notUsed'] == 'true';

        return ['genericList' => PhaGeneric::getGenericlist($tenant, $status, $deleted, $notUsed)];
    }
    
        public function actionGetgenericname() {
        $requestData = $_REQUEST;
        $modelClass = $this->modelClass;
        $totalData = $modelClass::find()->tenant()->active()->count();
        $totalFiltered = $totalData;
        
        // Order Records
        if (isset($requestData['order'])) {
            if ($requestData['order'][0]['dir'] == 'asc') {
                $sort_dir = SORT_ASC;
            } elseif ($requestData['order'][0]['dir'] == 'desc') {
                $sort_dir = SORT_DESC;
            }
            $order_array = [$requestData['columns'][$requestData['order'][0]['column']]['data'] => $sort_dir];
        }

        if (!empty($requestData['search']['value'])) {
            $totalFiltered = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'generic_name', $requestData['search']['value']],
                            ])
                    ->count();

            $genericNames = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'generic_name', $requestData['search']['value']],
                            ])
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        } else {
            $genericNames = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($genericNames as $generic) {
            $nestedData = array();
            $nestedData['generic_name'] = $generic->generic_name;
            $nestedData['status'] = $generic->status;
            $nestedData['generic_id'] = $generic->generic_id;
            $data[] = $nestedData;
        }

        $json_data = array(
            "draw" => intval($requestData['draw']),
            "recordsTotal" => intval($totalData),
            "recordsFiltered" => intval($totalFiltered),
            "data" => $data   // total data array
        );

        echo json_encode($json_data);
    }

}
